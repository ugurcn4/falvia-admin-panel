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
      .from('fortune_teller_stories')
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

// ==================== FALCI HİKAYELERİ YÖNETİMİ ====================

// Tüm falcı hikayelerini getir
export const getAllFortuneTellerStories = async (page = 0, limit = 10, filters = {}) => {
  try {
    let query = supabase
      .from('fortune_teller_stories')
      .select(`
        *,
        fortune_tellers:fortune_teller_id (
          id,
          name,
          profile_image
        )
      `)
      .order('created_at', { ascending: false });

    // Filtreler
    if (filters.fortune_teller_id) {
      query = query.eq('fortune_teller_id', filters.fortune_teller_id);
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    if (filters.media_type) {
      query = query.eq('media_type', filters.media_type);
    }

    // Sayfalama
    const from = page * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error } = await query;
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Falcı hikayesi oluştur
export const createFortuneTellerStory = async (storyData) => {
  try {
    const { data, error } = await supabase
      .from('fortune_teller_stories')
      .insert({
        ...storyData,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 saat sonra
        is_active: true,
        view_count: 0
      })
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Falcı hikayesi güncelle
export const updateFortuneTellerStory = async (id, updateData) => {
  try {
    const { data, error } = await supabase
      .from('fortune_teller_stories')
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

// Falcı hikayesi sil
export const deleteFortuneTellerStory = async (id) => {
  try {
    const { error } = await supabase
      .from('fortune_teller_stories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};

// Hikaye detayını getir
export const getFortuneTellerStory = async (id) => {
  try {
    const { data, error } = await supabase
      .from('fortune_teller_stories')
      .select(`
        *,
        fortune_tellers:fortune_teller_id (
          id,
          name,
          profile_image
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Hikaye istatistikleri
export const getStoryStatistics = async (storyId) => {
  try {
    // Hikaye görüntülenme verilerini getir
    const { data: views, error: viewsError } = await supabase
      .from('story_views')
      .select('*')
      .eq('story_id', storyId);

    if (viewsError) throw viewsError;

    const totalViews = views.length;
    const completedViews = views.filter(v => v.completed).length;
    const completionRate = totalViews > 0 ? (completedViews / totalViews) * 100 : 0;
    const averageViewDuration = views.length > 0 
      ? views.reduce((sum, v) => sum + v.view_duration, 0) / views.length 
      : 0;

    return {
      data: {
        totalViews,
        completedViews,
        completionRate: Math.round(completionRate * 100) / 100,
        averageViewDuration: Math.round(averageViewDuration * 100) / 100
      },
      error: null
    };
  } catch (error) {
    return { data: null, error };
  }
};

// Genel hikaye istatistikleri
export const getStoriesOverviewStatistics = async () => {
  try {
    // Toplam hikaye sayısı
    const { count: totalStories, error: storiesError } = await supabase
      .from('fortune_teller_stories')
      .select('*', { count: 'exact', head: true });

    if (storiesError) throw storiesError;

    // Aktif hikaye sayısı
    const { count: activeStories, error: activeError } = await supabase
      .from('fortune_teller_stories')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (activeError) throw activeError;

    // Toplam görüntülenme
    const { data: views, error: viewsError } = await supabase
      .from('story_views')
      .select('*');

    if (viewsError) throw viewsError;

    const totalViews = views.length;
    const completedViews = views.filter(v => v.completed).length;
    const averageCompletionRate = totalViews > 0 
      ? (completedViews / totalViews) * 100 
      : 0;

    return {
      data: {
        totalStories,
        activeStories,
        totalViews,
        averageCompletionRate: Math.round(averageCompletionRate * 100) / 100
      },
      error: null
    };
  } catch (error) {
    return { data: null, error };
  }
};

// Dosya yükleme
export const uploadStoryMedia = async (file, fileName) => {
  try {
    console.log('Uploading file:', fileName, 'Size:', file.size, 'Type:', file.type);
    
    // Kullanıcı kontrolü
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Kullanıcı oturumu bulunamadı');
    }
    console.log('Current user:', user.id);

    // Admin kontrolü - basit auth kontrolü
    console.log('Checking authentication only...');

    // Bucket kontrolünü kaldırdık, direkt yükleme yapıyoruz
    const { data, error } = await supabase.storage
      .from('fortune-teller-stories')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error details:', error);
      
      // Spesifik hata mesajları
      if (error.message?.includes('Bucket not found')) {
        throw new Error('Storage bucket bulunamadı. Lütfen Supabase dashboard\'dan fortune-teller-stories bucket\'ını oluşturun.');
      } else if (error.message?.includes('Insufficient permissions')) {
        throw new Error('Yeterli yetki yok. RLS politikalarını kontrol edin.');
      } else if (error.message?.includes('File size')) {
        throw new Error('Dosya boyutu çok büyük (max 50MB).');
      }
      
      throw error;
    }

    console.log('Upload successful:', data);

    // Public URL al
    const { data: urlData } = supabase.storage
      .from('fortune-teller-stories')
      .getPublicUrl(fileName);

    console.log('Public URL:', urlData.publicUrl);
    return { data: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Upload service error:', error);
    return { data: null, error };
  }
}; 