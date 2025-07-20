import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Form, 
  Alert,
  Spinner,
  ProgressBar
} from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  getFortuneTellerStory,
  updateFortuneTellerStory, 
  getAllFortuneTellers,
  uploadStoryMedia
} from '../services/supabaseService';
import { colors } from '../styles/colors';
import { 
  FaArrowLeft, 
  FaUpload, 
  FaImage, 
  FaVideo, 
  FaTrash,
  FaEye,
  FaClock,
  FaSave
} from 'react-icons/fa';

const EditStory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fortuneTellers, setFortuneTellers] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [videoDuration, setVideoDuration] = useState(15);
  const [originalStory, setOriginalStory] = useState(null);

  const [formData, setFormData] = useState({
    fortune_teller_id: '',
    caption: '',
    is_active: true
  });

  useEffect(() => {
    loadStory();
    loadFortuneTellers();
  }, [id]);

  const loadStory = async () => {
    try {
      setLoading(true);
      const { data, error } = await getFortuneTellerStory(id);
      if (error) {
        setError('Hikaye yüklenirken hata oluştu: ' + error.message);
      } else {
        setOriginalStory(data);
        setFormData({
          fortune_teller_id: data.fortune_teller_id || '',
          caption: data.caption || '',
          is_active: data.is_active !== undefined ? data.is_active : true
        });
        setMediaType(data.media_type || 'image');
        setVideoDuration(data.duration || 15);
        setPreviewUrl(data.media_url || '');
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadFortuneTellers = async () => {
    try {
      const { data, error } = await getAllFortuneTellers();
      if (error) {
        console.error('Falcılar yüklenirken hata:', error);
      } else {
        setFortuneTellers(data || []);
      }
    } catch (err) {
      console.error('Falcılar yüklenirken beklenmeyen hata:', err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Dosya boyutu kontrolü (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('Dosya boyutu 50MB\'dan büyük olamaz');
      return;
    }

    // Dosya tipi kontrolü
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      setError('Sadece resim ve video dosyaları kabul edilir');
      return;
    }

    setSelectedFile(file);
    setMediaType(isImage ? 'image' : 'video');
    setError('');

    // Önizleme oluştur
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Video süresini al
    if (isVideo) {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        const duration = Math.round(video.duration);
        if (duration > 15) {
          setError('Video süresi 15 saniyeden uzun olamaz');
          setSelectedFile(null);
          setPreviewUrl(originalStory?.media_url || '');
        } else {
          setVideoDuration(duration);
        }
      };
      video.src = url;
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(originalStory?.media_url || '');
    setMediaType(originalStory?.media_type || 'image');
    setVideoDuration(originalStory?.duration || 15);
    if (selectedFile) {
      URL.revokeObjectURL(selectedFile);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Form validasyonu
      if (!formData.fortune_teller_id.trim()) {
        setError('Falcı seçimi zorunludur');
        setSaving(false);
        return;
      }

      let mediaUrl = originalStory?.media_url;

      // Yeni dosya yüklendiyse
      if (selectedFile) {
        setUploadProgress(0);
        
        // Dosya adını temizle (Türkçe karakterleri ve boşlukları kaldır)
        const cleanFileName = selectedFile.name
          .replace(/[ğ]/g, 'g')
          .replace(/[ü]/g, 'u')
          .replace(/[ş]/g, 's')
          .replace(/[ı]/g, 'i')
          .replace(/[ö]/g, 'o')
          .replace(/[ç]/g, 'c')
          .replace(/[Ğ]/g, 'G')
          .replace(/[Ü]/g, 'U')
          .replace(/[Ş]/g, 'S')
          .replace(/[I]/g, 'I')
          .replace(/[Ö]/g, 'O')
          .replace(/[Ç]/g, 'C')
          .replace(/[^a-zA-Z0-9.-]/g, '_')
          .replace(/_+/g, '_');
        
        const fileName = `story-${Date.now()}-${cleanFileName}`;
        
        const { data: newMediaUrl, error: uploadError } = await uploadStoryMedia(selectedFile, fileName);
        
        if (uploadError) {
          setError('Dosya yüklenirken hata oluştu: ' + uploadError.message);
          setSaving(false);
          return;
        }

        mediaUrl = newMediaUrl;
        setUploadProgress(100);
      }

      // Hikaye güncelle
      const updateData = {
        ...formData,
        media_url: mediaUrl,
        media_type: mediaType,
        duration: mediaType === 'video' ? videoDuration : 15
      };

      const { error: updateError } = await updateFortuneTellerStory(id, updateData);
      
      if (updateError) {
        setError('Hikaye güncellenirken hata oluştu: ' + updateError.message);
      } else {
        setSuccess('Hikaye başarıyla güncellendi');
        setTimeout(() => {
          navigate('/stories');
        }, 2000);
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" variant="secondary" />
      </div>
    );
  }

  if (!originalStory) {
    return (
      <div className="text-center py-4">
        <h3>Hikaye bulunamadı</h3>
        <Button variant="primary" onClick={() => navigate('/stories')}>
          Geri Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="edit-story-page">
      {/* Başlık */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col>
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/stories')}
                className="mb-3"
              >
                <FaArrowLeft className="me-2" />
                Geri Dön
              </Button>
              <h2 className="mb-0">Hikaye Düzenle</h2>
              <p className="text-muted mb-0">
                "{originalStory.caption || 'Açıklama yok'}" hikayesini düzenleyin
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Hata ve Başarı Mesajları */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Falcı Seçimi */}
                <Form.Group className="mb-4">
                  <Form.Label>
                    <strong>Falcı Seçimi *</strong>
                  </Form.Label>
                  <Form.Select
                    name="fortune_teller_id"
                    value={formData.fortune_teller_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Falcı seçin...</option>
                    {fortuneTellers.map(fortuneTeller => (
                      <option key={fortuneTeller.id} value={fortuneTeller.id}>
                        {fortuneTeller.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Hikayeyi paylaşacak falcıyı seçin
                  </Form.Text>
                </Form.Group>

                {/* Medya Yükleme */}
                <Form.Group className="mb-4">
                  <Form.Label>
                    <strong>Medya Dosyası</strong>
                  </Form.Label>
                  
                  <div className="preview-area">
                    <div className="preview-header">
                      <div className="preview-info">
                        <span className="media-type-badge">
                          {mediaType === 'video' ? <FaVideo /> : <FaImage />}
                          {mediaType === 'video' ? 'Video' : 'Resim'}
                        </span>
                        <span className="file-name">
                          {selectedFile ? selectedFile.name : 'Mevcut dosya'}
                        </span>
                        {mediaType === 'video' && (
                          <span className="duration-badge">
                            <FaClock className="me-1" />
                            {videoDuration}s
                          </span>
                        )}
                      </div>
                      <div className="preview-actions">
                        <input
                          type="file"
                          id="file-upload"
                          accept="image/*,video/*"
                          onChange={handleFileSelect}
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="file-upload">
                          <Button variant="outline-primary" size="sm">
                            <FaUpload className="me-1" />
                            Değiştir
                          </Button>
                        </label>
                        {selectedFile && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={handleRemoveFile}
                            className="ms-2"
                          >
                            <FaTrash />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="preview-content">
                      {mediaType === 'video' ? (
                        <video 
                          src={previewUrl} 
                          controls 
                          className="preview-video"
                        />
                      ) : (
                        <img 
                          src={previewUrl} 
                          alt="Önizleme" 
                          className="preview-image"
                        />
                      )}
                    </div>
                  </div>
                  
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-3">
                      <ProgressBar 
                        now={uploadProgress} 
                        label={`${uploadProgress}%`}
                        variant="primary"
                      />
                    </div>
                  )}
                  
                  <Form.Text className="text-muted">
                    Yeni dosya seçmezseniz mevcut dosya korunacaktır<br/>
                    <span className="text-warning">Not: Türkçe karakterler otomatik olarak dönüştürülür</span>
                  </Form.Text>
                </Form.Group>

                {/* Açıklama */}
                <Form.Group className="mb-4">
                  <Form.Label>
                    <strong>Açıklama</strong>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="caption"
                    value={formData.caption}
                    onChange={handleInputChange}
                    placeholder="Hikaye açıklaması (opsiyonel)..."
                  />
                  <Form.Text className="text-muted">
                    Hikaye ile ilgili kısa bir açıklama ekleyebilirsiniz
                  </Form.Text>
                </Form.Group>

                {/* Durum */}
                <Form.Group className="mb-4">
                  <Form.Check
                    type="checkbox"
                    id="is-active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    label="Hikayeyi aktif olarak yayınla"
                  />
                  <Form.Text className="text-muted">
                    Aktif hikayeler kullanıcılar tarafından görüntülenebilir
                  </Form.Text>
                </Form.Group>

                {/* Butonlar */}
                <div className="d-flex gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={saving}
                    className="flex-fill"
                  >
                    {saving ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Güncelleniyor...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        Güncelle
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => navigate('/stories')}
                    disabled={saving}
                  >
                    İptal
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Mevcut Hikaye Bilgileri */}
          <Card className="info-card">
            <Card.Header>
              <h5 className="mb-0">
                <FaEye className="me-2" />
                Mevcut Hikaye Bilgileri
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="info-item">
                <strong>Falcı:</strong>
                <span className="text-muted">
                  {originalStory.fortune_tellers?.name}
                </span>
              </div>
              
              <div className="info-item">
                <strong>Medya Tipi:</strong>
                <span className="text-muted">
                  {originalStory.media_type === 'video' ? 'Video' : 'Resim'}
                </span>
              </div>
              
              {originalStory.media_type === 'video' && (
                <div className="info-item">
                  <strong>Süre:</strong>
                  <span className="text-muted">{originalStory.duration} saniye</span>
                </div>
              )}
              
              <div className="info-item">
                <strong>Görüntülenme:</strong>
                <span className="text-muted">{originalStory.view_count || 0}</span>
              </div>
              
              <div className="info-item">
                <strong>Oluşturulma:</strong>
                <span className="text-muted">
                  {new Date(originalStory.created_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
              
              <div className="info-item">
                <strong>Geçerlilik:</strong>
                <span className="text-muted">
                  {new Date(originalStory.expires_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
              
              <div className="info-item">
                <strong>Durum:</strong>
                <span className={originalStory.is_active ? 'text-success' : 'text-muted'}>
                  {originalStory.is_active ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            </Card.Body>
          </Card>

          {/* Değişiklik Bilgileri */}
          <Card className="changes-card mt-3">
            <Card.Header>
              <h6 className="mb-0">Değişiklik Bilgileri</h6>
            </Card.Header>
      <Card.Body>
              <div className="change-item">
                <strong>Medya:</strong>
                <span className={selectedFile ? 'text-warning' : 'text-muted'}>
                  {selectedFile ? 'Değiştirilecek' : 'Değişmedi'}
                </span>
              </div>
              
              <div className="change-item">
                <strong>Falcı:</strong>
                <span className={
                  formData.fortune_teller_id !== originalStory.fortune_teller_id 
                    ? 'text-warning' 
                    : 'text-muted'
                }>
                  {formData.fortune_teller_id !== originalStory.fortune_teller_id 
                    ? 'Değiştirilecek' 
                    : 'Değişmedi'}
                </span>
              </div>
              
              <div className="change-item">
                <strong>Açıklama:</strong>
                <span className={
                  formData.caption !== originalStory.caption 
                    ? 'text-warning' 
                    : 'text-muted'
                }>
                  {formData.caption !== originalStory.caption 
                    ? 'Değiştirilecek' 
                    : 'Değişmedi'}
                </span>
              </div>
              
              <div className="change-item">
                <strong>Durum:</strong>
                <span className={
                  formData.is_active !== originalStory.is_active 
                    ? 'text-warning' 
                    : 'text-muted'
                }>
                  {formData.is_active !== originalStory.is_active 
                    ? 'Değiştirilecek' 
                    : 'Değişmedi'}
                </span>
              </div>
      </Card.Body>
    </Card>
        </Col>
      </Row>

      <style>{`
        .edit-story-page {
          padding: 20px;
        }
        
        .preview-area {
          border: 1px solid ${colors.border};
          border-radius: 12px;
          overflow: hidden;
          background: ${colors.card};
        }
        
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: ${colors.background};
          border-bottom: 1px solid ${colors.border};
        }
        
        .preview-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .media-type-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          background: ${colors.primary};
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
        }
        
        .duration-badge {
          display: flex;
          align-items: center;
          background: ${colors.warning};
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
        }
        
        .file-name {
          color: ${colors.text.secondary};
          font-size: 0.9rem;
        }
        
        .preview-actions {
          display: flex;
          align-items: center;
        }
        
        .preview-content {
          padding: 15px;
          text-align: center;
        }
        
        .preview-image {
          max-width: 100%;
          max-height: 300px;
          border-radius: 8px;
        }
        
        .preview-video {
          max-width: 100%;
          max-height: 300px;
          border-radius: 8px;
        }
        
        .info-card, .changes-card {
          background: ${colors.card};
          border: 1px solid ${colors.border};
          border-radius: 12px;
        }
        
        .info-item, .change-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid ${colors.border};
        }
        
        .info-item:last-child, .change-item:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
};

export default EditStory; 