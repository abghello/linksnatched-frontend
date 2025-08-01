import { createClient } from '@/utils/supabase/client';

export async function createSubscription() {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { data: null, error: userError || 'No user found' };
  }

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(
        {
          user_id: user.id,
          start_date: new Date(),
          end_date: null,
          plan: null,
          period: null,
          status: 'pending',
        },
        {
          onConflict: 'user_id',
        }
      )
      .single();

    return { data };
  } catch (error) {
    console.error(error);
    return { data: null, error: error };
  }
}
