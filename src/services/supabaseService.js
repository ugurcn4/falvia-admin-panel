import { supabase } from '../lib/supabase';

// ==================== FAL YORUMLARI YÖNETİMİ ====================

// Admin paneli için tüm yorumları getir
export const getAllReviewsForAdmin = async (page = 0, limit = 50) => {
  try {
    // Önce yorumları alalım
    const { data: reviews, error: reviewsError } = await supabase
      .from('fortune_reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (reviewsError) throw reviewsError;

    // Her yorum için kullanıcı ve fal bilgilerini alalım
    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        // Kullanıcı bilgilerini al
        const { data: user } = await supabase
          .from('users')
          .select('first_name, last_name, full_name, email')
          .eq('id', review.user_id)
          .single();

        // Fal bilgilerini al
        const { data: fortune } = await supabase
          .from('fortunes')
          .select(`
            category,
            status,
            created_at,
            fortune_teller_id
          `)
          .eq('id', review.fortune_id)
          .single();

        // Falcı bilgilerini al (eğer varsa)
        let fortuneTeller = null;
        if (fortune?.fortune_teller_id) {
          const { data: ft } = await supabase
            .from('fortune_tellers')
            .select('name')
            .eq('id', fortune.fortune_teller_id)
            .single();
          fortuneTeller = ft;
        }

        return {
          ...review,
          user,
          fortune: {
            ...fortune,
            fortune_teller: fortuneTeller
          }
        };
      })
    );

    return { data: enrichedReviews, error: null };
  } catch (error) {
    console.error('Admin yorumları alma hatası:', error);
    return { data: null, error: error.message };
  }
};

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
    
    if (error) {
      console.error('Get users error:', error);
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Get all users error:', error);
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
    
    // Önce kullanıcının var olup olmadığını kontrol et
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, is_admin')
      .eq('id', id)
      .single();
    
    if (checkError) {
      console.error('User check error:', checkError);
      throw new Error(`Kullanıcı bulunamadı: ${checkError.message}`);
    }
    
    
    // Güncelleme işlemini dene
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', String(id))
      .select()
      .single();
    
    if (error) {
      console.error('Update user error:', error);
      
      // Eğer RLS hatası varsa, alternatif yöntem dene
      if (error.code === 'PGRST116' || error.message.includes('multiple (or no) rows')) {
        
        // Upsert kullanarak güncelleme dene
        const { data: upsertData, error: upsertError } = await supabase
          .from('users')
          .upsert({ id: String(id), ...updateData })
          .select()
          .single();
        
        if (upsertError) {
          console.error('Upsert error:', upsertError);
          throw upsertError;
        }
        
        return { data: upsertData, error: null };
      }
      
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Update user catch error:', error);
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

// Fal resmi güncelle
export const updateFortuneImage = async (id, imageUrl) => {
  try {
    const { data, error } = await supabase
      .from('fortunes')
      .update({ 
        image_url: imageUrl
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
    
    // Kullanıcı kontrolü
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Kullanıcı oturumu bulunamadı');
    }

    // Admin kontrolü - basit auth kontrolü

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


    // Public URL al
    const { data: urlData } = supabase.storage
      .from('fortune-teller-stories')
      .getPublicUrl(fileName);

    return { data: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Upload service error:', error);
    return { data: null, error };
  }
};

// Fal resmi yükleme
export const uploadFortuneImage = async (file, fileName) => {
  try {
    
    // Kullanıcı kontrolü
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Kullanıcı oturumu bulunamadı');
    }

    // Fal resimleri için fortunes bucket kullan
    const { data, error } = await supabase.storage
      .from('fortunes')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Fortune image upload error:', error);
      
      // Bucket yoksa oluştur
      if (error.message?.includes('Bucket not found')) {
        throw new Error('Fal resimleri için storage bucket bulunamadı. Lütfen Supabase dashboard\'dan fortunes bucket\'ını oluşturun.');
      }
      
      throw error;
    }

    // Public URL al
    const { data: urlData } = supabase.storage
      .from('fortunes')
      .getPublicUrl(fileName);

    return { data: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Fortune image upload service error:', error);
    return { data: null, error };
  }
}; 

// ==================== BİLDİRİM YÖNETİMİ ====================

// Tüm kullanıcılara bildirim gönder
export const sendNotificationToUsers = async (notificationData) => {
  try {
    const { title, content, targetType, userIds } = notificationData;
    
    // Her kullanıcı için ayrı bildirim kaydı oluştur
    const notifications = userIds.map(userId => ({
      user_id: userId,
      title,
      content,
      type: 'admin_notification',
      target_type: targetType,
      read: false,
      created_at: new Date().toISOString()
    }));

    // Veritabanına kaydet
    const { data: dbResult, error: dbError } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (dbError) throw dbError;

    // Push notification gönder
    try {
      // Kullanıcıların push tokenlarını al
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, push_token')
        .in('id', userIds)
        .not('push_token', 'is', null);

      if (usersError) {
        console.error('Push token alınırken hata:', usersError);
      } else if (users && users.length > 0) {
        // Expo Push API ile bildirim gönder
        const messages = users.map(user => ({
          to: user.push_token,
          sound: 'default',
          title,
          body: content,
          data: {
            type: 'admin_notification',
            source: 'admin_panel',
            timestamp: new Date().toISOString()
          },
          priority: 'high',
          channelId: 'default',
        }));

        // Expo Push API'ye gönder
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messages),
        });

        const pushResult = await response.json();
        
        // Hata kontrolü
        if (Array.isArray(pushResult)) {
          pushResult.forEach((result, index) => {
            if (result.status === 'error') {
              console.error(`Push ${index} hatası:`, result);
            }
          });
        } else if (pushResult.status === 'error') {
          console.error('Push gönderme hatası:', pushResult);
        }
      }
    } catch (pushError) {
      console.error('Push notification gönderme hatası:', pushError);
      // Push notification hatası veritabanı kaydını etkilemesin
    }

    return { success: true, data: dbResult, error: null };
  } catch (error) {
    console.error('Bildirim gönderme hatası:', error);
    return { success: false, data: null, error };
  }
};

// Bildirim geçmişini getir
export const getNotificationHistory = async () => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        id,
        title,
        content,
        type,
        target_type,
        created_at,
        profiles:user_id (
          id,
          full_name,
          first_name,
          last_name,
          email
        )
      `)
      .eq('type', 'admin_notification')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Benzersiz bildirimler için grupla (aynı title ve content olanları)
    const uniqueNotifications = [];
    const seen = new Set();

    data?.forEach(notification => {
      const key = `${notification.title}-${notification.content}-${notification.target_type}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueNotifications.push({
          ...notification,
          // İlk bildirimin verilerini kullan
          created_at: notification.created_at
        });
      }
    });

    return { data: uniqueNotifications, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Bildirimi okundu olarak işaretle
export const markNotificationAsRead = async (notificationId) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Kullanıcının okunmamış bildirim sayısını getir
export const getUnreadNotificationCount = async (userId) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return { count, error: null };
  } catch (error) {
    return { count: 0, error };
  }
};

// Kullanıcının bildirimlerini getir
export const getUserNotifications = async (userId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}; 