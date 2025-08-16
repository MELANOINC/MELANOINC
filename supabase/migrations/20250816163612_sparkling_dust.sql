-- MELANO INC - Subscription & Revenue Schema
-- Extends existing CRM with subscription and revenue tracking

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    customer_id TEXT, -- Stripe customer ID
    subscription_id TEXT, -- Stripe subscription ID
    plan_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    interval_type TEXT NOT NULL DEFAULT 'month', -- month, year
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT subscriptions_status_check CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'trialing', 'unpaid'))
);

-- Revenue tracking
CREATE TABLE IF NOT EXISTS revenue_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES subscriptions(id),
    user_id UUID NOT NULL,
    event_type TEXT NOT NULL, -- charge_succeeded, subscription_created, subscription_canceled, etc.
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    stripe_event_id TEXT,
    processed_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT revenue_events_type_check CHECK (event_type IN ('charge_succeeded', 'subscription_created', 'subscription_updated', 'subscription_canceled', 'invoice_paid', 'refund'))
);

-- User onboarding progress
CREATE TABLE IF NOT EXISTS onboarding_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    step_name TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(user_id, step_name)
);

-- Email sequences tracking
CREATE TABLE IF NOT EXISTS email_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    sequence_name TEXT NOT NULL,
    email_index INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT email_status_check CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'failed'))
);

-- Analytics aggregates (for dashboard)
CREATE TABLE IF NOT EXISTS revenue_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    mrr DECIMAL(12,2) DEFAULT 0, -- Monthly Recurring Revenue
    arr DECIMAL(12,2) DEFAULT 0, -- Annual Recurring Revenue
    active_subscriptions INTEGER DEFAULT 0,
    new_subscriptions INTEGER DEFAULT 0,
    canceled_subscriptions INTEGER DEFAULT 0,
    churn_rate DECIMAL(5,4) DEFAULT 0,
    ltv DECIMAL(10,2) DEFAULT 0, -- Lifetime Value
    cac DECIMAL(10,2) DEFAULT 0, -- Customer Acquisition Cost
    conversion_rate DECIMAL(5,4) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(customer_id);

CREATE INDEX IF NOT EXISTS idx_revenue_events_user_id ON revenue_events(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_events_type ON revenue_events(event_type);
CREATE INDEX IF NOT EXISTS idx_revenue_events_processed_at ON revenue_events(processed_at);

CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_completed ON onboarding_progress(completed);

CREATE INDEX IF NOT EXISTS idx_email_sequences_user_id ON email_sequences(user_id);
CREATE INDEX IF NOT EXISTS idx_email_sequences_status ON email_sequences(status);
CREATE INDEX IF NOT EXISTS idx_email_sequences_scheduled ON email_sequences(scheduled_for);

-- Row Level Security (RLS)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Subscriptions: Users can only see their own
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- Revenue events: Users can see their own, service role can manage all
CREATE POLICY "Users can view own revenue events" ON revenue_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage revenue events" ON revenue_events
    FOR ALL USING (auth.role() = 'service_role');

-- Onboarding progress: Users can manage their own
CREATE POLICY "Users can manage own onboarding progress" ON onboarding_progress
    FOR ALL USING (auth.uid() = user_id);

-- Email sequences: Users can view their own, service role manages
CREATE POLICY "Users can view own email sequences" ON email_sequences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage email sequences" ON email_sequences
    FOR ALL USING (auth.role() = 'service_role');

-- Revenue analytics: Read-only for authenticated users, service role can write
CREATE POLICY "Authenticated users can view revenue analytics" ON revenue_analytics
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can manage revenue analytics" ON revenue_analytics
    FOR ALL USING (auth.role() = 'service_role');

-- Functions for revenue calculations
CREATE OR REPLACE FUNCTION calculate_mrr()
RETURNS DECIMAL AS $$
DECLARE
    total_mrr DECIMAL;
BEGIN
    SELECT SUM(
        CASE 
            WHEN interval_type = 'month' THEN price
            WHEN interval_type = 'year' THEN price / 12
            ELSE 0
        END
    ) INTO total_mrr
    FROM subscriptions 
    WHERE status = 'active' 
    AND (trial_end IS NULL OR trial_end < now());
    
    RETURN COALESCE(total_mrr, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_revenue_analytics()
RETURNS void AS $$
DECLARE
    today DATE := CURRENT_DATE;
    current_mrr DECIMAL;
    active_subs INTEGER;
    new_subs INTEGER;
    canceled_subs INTEGER;
    current_churn DECIMAL;
BEGIN
    -- Calculate current MRR
    SELECT calculate_mrr() INTO current_mrr;
    
    -- Count active subscriptions
    SELECT COUNT(*) INTO active_subs
    FROM subscriptions 
    WHERE status = 'active';
    
    -- Count new subscriptions today
    SELECT COUNT(*) INTO new_subs
    FROM subscriptions 
    WHERE DATE(created_at) = today;
    
    -- Count canceled subscriptions today
    SELECT COUNT(*) INTO canceled_subs
    FROM subscriptions 
    WHERE DATE(canceled_at) = today;
    
    -- Calculate churn rate (simplified)
    IF active_subs > 0 THEN
        current_churn := canceled_subs::DECIMAL / active_subs::DECIMAL;
    ELSE
        current_churn := 0;
    END IF;
    
    -- Insert or update analytics record
    INSERT INTO revenue_analytics (
        date, mrr, arr, active_subscriptions, 
        new_subscriptions, canceled_subscriptions, churn_rate
    )
    VALUES (
        today, current_mrr, current_mrr * 12, active_subs,
        new_subs, canceled_subs, current_churn
    )
    ON CONFLICT (date) 
    DO UPDATE SET
        mrr = EXCLUDED.mrr,
        arr = EXCLUDED.arr,
        active_subscriptions = EXCLUDED.active_subscriptions,
        new_subscriptions = EXCLUDED.new_subscriptions,
        canceled_subscriptions = EXCLUDED.canceled_subscriptions,
        churn_rate = EXCLUDED.churn_rate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update analytics when subscriptions change
CREATE OR REPLACE FUNCTION trigger_update_revenue_analytics()
RETURNS trigger AS $$
BEGIN
    PERFORM update_revenue_analytics();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_analytics_trigger
    AFTER INSERT OR UPDATE OR DELETE ON subscriptions
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_update_revenue_analytics();

-- Initial analytics calculation
SELECT update_revenue_analytics();

COMMENT ON TABLE subscriptions IS 'User subscriptions and billing information';
COMMENT ON TABLE revenue_events IS 'All revenue-related events for tracking and analytics';
COMMENT ON TABLE onboarding_progress IS 'User onboarding step completion tracking';
COMMENT ON TABLE email_sequences IS 'Automated email sequence tracking and analytics';
COMMENT ON TABLE revenue_analytics IS 'Daily aggregated revenue and business metrics';