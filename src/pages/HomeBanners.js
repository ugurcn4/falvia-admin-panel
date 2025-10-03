import React, { useEffect, useState } from 'react';
import { Card, Button, Table, Badge, Modal, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FaPlus, FaEdit, FaCopy, FaTrash, FaToggleOn, FaToggleOff, FaEye, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const HomeBanners = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  const [deleteState, setDeleteState] = useState({ show: false, banner: null });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('home_banners')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Bannerlar yüklenirken hata:', error);
      showAlert('Bannerlar yüklenirken hata oluştu', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 2500);
  };

  const toggleEnabled = async (banner) => {
    try {
      const { data, error } = await supabase
        .from('home_banners')
        .update({ is_enabled: !banner.is_enabled, updated_at: new Date().toISOString() })
        .eq('id', banner.id)
        .select()
        .single();
      if (error) throw error;
      setBanners(prev => prev.map(b => (b.id === banner.id ? data : b)));
      showAlert(`Banner ${data.is_enabled ? 'aktifleştirildi' : 'pasifleştirildi'}`);
    } catch (error) {
      console.error('Aktifleştirme/pasifleştirme hatası:', error);
      showAlert('İşlem sırasında hata oluştu', 'danger');
    }
  };

  const updatePriority = async (banner, change) => {
    try {
      const newPriority = Math.max(0, (banner.priority || 0) + change);
      const { data, error } = await supabase
        .from('home_banners')
        .update({ priority: newPriority, updated_at: new Date().toISOString() })
        .eq('id', banner.id)
        .select()
        .single();
      if (error) throw error;

      // Listeyi yeniden sırala
      setBanners(prev => {
        const updated = prev.map(b => b.id === banner.id ? data : b);
        return updated.sort((a, b) => {
          if (b.priority !== a.priority) return b.priority - a.priority;
          return new Date(b.created_at) - new Date(a.created_at);
        });
      });
      
      showAlert(`Banner önceliği ${newPriority} olarak güncellendi`, 'success');
    } catch (error) {
      console.error('Priority update error:', error);
      showAlert('Öncelik güncellenirken hata oluştu', 'danger');
    }
  };

  const duplicateBanner = async (banner) => {
    try {
      const copy = { ...banner };
      delete copy.id;
      copy.title = `${banner.title || 'Banner'} (Kopya)`;
      copy.is_enabled = false;
      copy.created_at = new Date().toISOString();
      copy.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('home_banners')
        .insert(copy)
        .select()
        .single();
      if (error) throw error;
      setBanners(prev => [data, ...prev]);
      showAlert('Banner kopyalandı');
    } catch (error) {
      console.error('Kopyalama hatası:', error);
      showAlert('Banner kopyalanırken hata oluştu', 'danger');
    }
  };

  const confirmDelete = (banner) => setDeleteState({ show: true, banner });
  const closeDelete = () => setDeleteState({ show: false, banner: null });

  const handleDelete = async () => {
    if (!deleteState.banner) return;
    try {
      const { error } = await supabase
        .from('home_banners')
        .delete()
        .eq('id', deleteState.banner.id);
      if (error) throw error;
      setBanners(prev => prev.filter(b => b.id !== deleteState.banner.id));
      showAlert('Banner silindi');
    } catch (error) {
      console.error('Silme hatası:', error);
      showAlert('Banner silinirken hata oluştu', 'danger');
    } finally {
      closeDelete();
    }
  };

  const formatDateTime = (v) => v ? new Date(v).toLocaleString('tr-TR') : '-';
  const renderPlatforms = (arr) => Array.isArray(arr) && arr.length ? arr.join(', ') : '-';

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>🏠 Home Banner Yönetimi</h2>
          <p className="text-muted mb-0">
            Banner'lar öncelik sırasına göre slider olarak görüntülenir. Yüksek öncelik → Düşük öncelik
          </p>
        </div>
        <Button as={Link} to="/home-banners/add" variant="primary" className="d-flex align-items-center gap-2">
          <FaPlus /> Oluştur
        </Button>
      </div>

      {alert.show && (
        <Alert variant={alert.variant} dismissible onClose={() => setAlert({ show: false, message: '', variant: 'success' })}>
          {alert.message}
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Yükleniyor...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped hover className="align-middle">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>Sıra</th>
                    <th style={{ width: '100px' }}>Durum</th>
                    <th>Başlık</th>
                    <th style={{ width: '80px' }}>Öncelik</th>
                    <th style={{ width: '140px' }}>Başlangıç</th>
                    <th style={{ width: '140px' }}>Bitiş</th>
                    <th style={{ width: '100px' }}>Platformlar</th>
                    <th style={{ width: '80px' }}>Min App</th>
                    <th className="text-end" style={{ width: '160px' }}>Aksiyonlar</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center text-muted py-4">Kayıt bulunamadı</td>
                    </tr>
                  )}
                  {banners.map((banner, index) => (
                    <tr key={banner.id}>
                      <td>
                        <Badge 
                          bg={banner.is_enabled ? "primary" : "light"} 
                          text={banner.is_enabled ? "light" : "dark"}
                          className="fw-bold"
                        >
                          {index + 1}
                        </Badge>
                      </td>
                      <td>
                        {banner.is_enabled ? (
                          <Badge bg="success">Aktif</Badge>
                        ) : (
                          <Badge bg="secondary">Pasif</Badge>
                        )}
                      </td>
                      <td className="text-truncate" style={{ maxWidth: 260 }}>
                        <div className="fw-semibold">{banner.title || '-'}</div>
                        {banner.subtitle && (
                          <small className="text-muted">{banner.subtitle}</small>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            style={{ fontSize: '10px', lineHeight: 1, padding: '2px 4px' }}
                            onClick={() => updatePriority(banner, 1)}
                            title="Önceliği artır"
                          >
                            <FaArrowUp />
                          </Button>
                          <Badge 
                            bg="info" 
                            className="fs-6 fw-bold mx-1"
                          >
                            {Number.isFinite(banner.priority) ? banner.priority : 0}
                          </Badge>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            style={{ fontSize: '10px', lineHeight: 1, padding: '2px 4px' }}
                            onClick={() => updatePriority(banner, -1)}
                            title="Önceliği azalt"
                            disabled={(banner.priority || 0) <= 0}
                          >
                            <FaArrowDown />
                          </Button>
                        </div>
                      </td>
                      <td>{formatDateTime(banner.start_at)}</td>
                      <td>{formatDateTime(banner.end_at)}</td>
                      <td>{renderPlatforms(banner.platforms)}</td>
                      <td>{banner.min_app_version || '-'}</td>
                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => toggleEnabled(banner)}
                            title={banner.is_enabled ? 'Pasifleştir' : 'Aktifleştir'}
                          >
                            {banner.is_enabled ? <FaToggleOff /> : <FaToggleOn />}
                          </Button>
                          <Button
                            as={Link}
                            to={`/home-banners/edit/${banner.id}`}
                            variant="outline-warning"
                            size="sm"
                            title="Düzenle"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => duplicateBanner(banner)}
                            title="Kopyala"
                          >
                            <FaCopy />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => confirmDelete(banner)}
                            title="Sil"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={deleteState.show} onHide={closeDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title>Banner Sil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bu banner'ı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDelete}>İptal</Button>
          <Button variant="danger" onClick={handleDelete}>Sil</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HomeBanners; 