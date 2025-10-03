import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import HomeBannerForm from '../components/HomeBannerForm';

const AddHomeBanner = () => {
  const navigate = useNavigate();

  const handleSave = async (payload) => {
    const { data, error } = await supabase
      .from('home_banners')
      .insert({ ...payload })
      .select()
      .single();
    if (error) {
      // Supabase hatasını UI'da görmek için throw edebiliriz
      throw error;
    }
    return !!data;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🏠 Yeni Home Banner</h2>
        <Button variant="outline-secondary" onClick={() => navigate('/home-banners')}>Geri Dön</Button>
      </div>
      <HomeBannerForm onSave={handleSave} onSuccess={() => navigate('/home-banners')} />
    </div>
  );
};

export default AddHomeBanner; 