import { createClient } from '@/utils/supabase/client';
import { IUser } from '@/types';

export async function getUser(
  userId: string
): Promise<{ data: IUser | null; error?: any }> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    const user = {
      id: data.id,
      email: data.email,
      plan: data.plan,
      role: data.role,
      createdAt: data.created_at,
    };

    return { data: user };
  } catch (error) {
    console.error(error);
    return { data: null, error: error };
  }
}

export async function getUsers(
  userId: string
): Promise<{ data: IUser[] | null; error?: any }> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.from('users').select('*');

    const tempUsers = data?.map((user) => ({
      id: user.id,
      email: user.email,
      plan: user.plan,
      role: user.role,
      customerId: user.customer_id,
      createdAt: user.created_at,
    }));

    return { data: tempUsers || [] };
  } catch (error) {
    console.error(error);
    return { data: null, error: error };
  }
}
