import { supabase } from '@lib/supabase';

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    interval: 'month' | 'year';
    features: string[];
}

export const PLANS: SubscriptionPlan[] = [
    {
        id: 'free',
        name: 'Recruit',
        price: 0,
        interval: 'month',
        features: [
            'Access to basic labs',
            'Community support',
            'Basic profile stats'
        ]
    },
    {
        id: 'pro',
        name: 'Operative',
        price: 29,
        interval: 'month',
        features: [
            'Unlimited access to all labs',
            'CORTEX AI Mentor',
            'Verified Certificates',
            'Priority support',
            'Career Mission Control'
        ]
    }
];

export const subscriptionService = {
    async getSubscriptionStatus(userId: string) {
        const { data, error } = await supabase
            .from('users')
            .select('subscription_tier, subscription_status')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching subscription:', error);
            return null;
        }
        return data;
    },

    async upgradeToPro(userId: string): Promise<{ success: boolean; error?: string }> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // In a real app, this would call a backend endpoint to create a Stripe Checkout session
        // For this demo, we'll directly update the profile using the RPC function we defined

        const { error } = await supabase.rpc('upgrade_to_pro', { user_id: userId });

        if (error) {
            console.error('Upgrade failed:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    },

    async cancelSubscription() {
        // Mock cancellation
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
    }
};
