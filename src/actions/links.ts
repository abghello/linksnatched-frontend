import { createClient } from '@/utils/supabase/client';

export async function getLinks(userId: string) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', userId);

    const data1 = data?.map((link) => ({
      id: link.id,
      userId: link.user_id,
      domain: link.domain,
      resolvedTitle: link.resolved_title,
      givenTitle: link.given_title,
      displayUrl: link.display_url,
      topImageUrl: link.top_image_url,
      givenUrl: link.given_url,
      resolvedUrl: link.resolved_url,
      tags: link.tags,
      createdAt: link.created_at,
    }));

    return { data: data1 };
  } catch (error) {
    console.error(error);
    return { data: null, error: error };
  }
}
