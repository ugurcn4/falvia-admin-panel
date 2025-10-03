import React, { useEffect, useState } from 'react';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import HomeBannerForm from '../components/HomeBannerForm';

const EditHomeBanner = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('home_banners')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        setBanner(data);
      } catch (err) {
        console.error('[EditHomeBanner] fetch error:', err);
        setError('Kayıt yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchBanner();
  }, [id]);

  const handleSave = async (payload) => {
    const { data, error } = await supabase
      .from('home_banners')
      .update({ ...payload })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      throw error;
    }
    return !!data;
  };

  if (loading) {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>🏠 Home Banner Düzenle</h2>
          <Button variant="outline-secondary" onClick={() => navigate('/home-banners')}>Geri Dön</Button>
        </div>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '40vh' }}>
          <Spinner animation="border" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>🏠 Home Banner Düzenle</h2>
          <Button variant="outline-secondary" onClick={() => navigate('/home-banners')}>Geri Dön</Button>
        </div>
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🏠 Home Banner Düzenle</h2>
        <Button variant="outline-secondary" onClick={() => navigate('/home-banners')}>Geri Dön</Button>
      </div>
      <HomeBannerForm initialData={banner} onSave={handleSave} onSuccess={() => navigate('/home-banners')} />
    </div>
  );
};

export default EditHomeBanner; 