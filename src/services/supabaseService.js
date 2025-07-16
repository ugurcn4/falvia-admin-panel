import { supabase } from '../lib/supabase';

// ==================== FALCI YÖNETİMİ ====================

// Tüm falcıları getir
export const getAllFortuneTellers = async () => {
  try {
    const { data, error } = await supabase
      .from('fortune_tellers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Falcı oluştur
export const createFortuneTeller = async (fortuneTellerData) => {
  try {
    const { data, error } = await supabase
      .from('fortune_tellers')
      .insert(fortuneTellerData)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Falcı güncelle
export const updateFortuneTeller = async (id, updateData) => {
  try {
    const { data, error } = await supabase
      .from('fortune_tellers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Falcı sil
export const deleteFortuneTeller = async (id) => {
  try {
    const { error } = await supabase
      .from('fortune_tellers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};

// Falcı müsaitlik durumunu değiştir
export const toggleFortuneTellerAvailability = async (id, isAvailable) => {
  try {
    const { data, error } = await supabase
      .from('fortune_tellers')
      .update({ is_available: isAvailable })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// ==================== HİKAYE YÖNETİMİ ====================

// Tüm hikayeleri getir
export const getAllStories = async () => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        users:user_id (
          id,
          first_name,
          last_name,
          full_name,
          profile_image
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Hikaye oluştur
export const createStory = async (storyData) => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .insert(storyData)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Hikaye güncelle
export const updateStory = async (id, updateData) => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Hikaye sil
export const deleteStory = async (id) => {
  try {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};

// ==================== KULLANICI YÖNETİMİ ====================

// Tüm kullanıcıları getir
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Admin kullanıcıları getir
export const getAdminUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_admin', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Kullanıcı güncelle
export const updateUser = async (id, updateData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// ==================== FAL YÖNETİMİ ====================

// Tüm falları getir
export const getAllFortunes = async () => {
  try {
    const { data, error } = await supabase
      .from('fortunes')
      .select(`
        *,
        users:user_id (
          id,
          first_name,
          last_name,
          full_name,
          profile_image
        ),
        fortune_tellers:fortune_teller_id (
          id,
          name,
          profile_image
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Fal durumunu güncelle
export const updateFortuneStatus = async (id, status) => {
  try {
    const { data, error } = await supabase
      .from('fortunes')
      .update({ 
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// ==================== İSTATİSTİKLER ====================

// Dashboard istatistikleri
export const getDashboardStats = async () => {
  try {
    // Toplam kullanıcı sayısı
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    // Toplam falcı sayısı
    const { count: totalFortuneTellers } = await supabase
      .from('fortune_tellers')
      .select('*', { count: 'exact', head: true });
    
    // Toplam fal sayısı
    const { count: totalFortunes } = await supabase
      .from('fortunes')
      .select('*', { count: 'exact', head: true });
    
    // Toplam hikaye sayısı
    const { count: totalStories } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true });
    
    // Müsait falcı sayısı
    const { count: availableFortuneTellers } = await supabase
      .from('fortune_tellers')
      .select('*', { count: 'exact', head: true })
      .eq('is_available', true);
    
    // Bekleyen fal sayısı
    const { count: pendingFortunes } = await supabase
      .from('fortunes')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    return {
      data: {
        totalUsers: totalUsers || 0,
        totalFortuneTellers: totalFortuneTellers || 0,
        totalFortunes: totalFortunes || 0,
        totalStories: totalStories || 0,
        availableFortuneTellers: availableFortuneTellers || 0,
        pendingFortunes: pendingFortunes || 0
      },
      error: null
    };
  } catch (error) {
    return { data: null, error };
  }
}; 