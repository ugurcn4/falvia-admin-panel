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
import { useNavigate } from 'react-router-dom';
import { 
  createFortuneTellerStory, 
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
  FaClock
} from 'react-icons/fa';

const AddStory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fortuneTellers, setFortuneTellers] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [videoDuration, setVideoDuration] = useState(15);

  const [formData, setFormData] = useState({
    fortune_teller_id: '',
    caption: '',
    is_active: true
  });

  useEffect(() => {
    loadFortuneTellers();
  }, []);

  const loadFortuneTellers = async () => {
    try {
      const { data, error } = await getAllFortuneTellers();
      if (error) {
        setError('Falcılar yüklenirken hata oluştu: ' + error.message);
      } else {
        setFortuneTellers(data || []);
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
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
          setPreviewUrl('');
        } else {
          setVideoDuration(duration);
        }
      };
      video.src = url;
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setMediaType('image');
    setVideoDuration(15);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
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
    setLoading(true);
    setError('');

    try {
      // Form validasyonu
      if (!formData.fortune_teller_id.trim()) {
        setError('Falcı seçimi zorunludur');
        setLoading(false);
        return;
      }

      if (!selectedFile) {
        setError('Medya dosyası seçimi zorunludur');
        setLoading(false);
        return;
      }

      // Dosya yükleme
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
      
      const { data: mediaUrl, error: uploadError } = await uploadStoryMedia(selectedFile, fileName);
      
      if (uploadError) {
        setError('Dosya yüklenirken hata oluştu: ' + uploadError.message);
        setLoading(false);
        return;
      }

      setUploadProgress(100);

      // Hikaye oluştur
      const storyData = {
        ...formData,
        media_url: mediaUrl,
        media_type: mediaType,
        duration: mediaType === 'video' ? videoDuration : 15
      };

      const { error: createError } = await createFortuneTellerStory(storyData);
      
      if (createError) {
        setError('Hikaye oluşturulurken hata oluştu: ' + createError.message);
      } else {
        setSuccess('Hikaye başarıyla oluşturuldu');
        setTimeout(() => {
          navigate('/stories');
        }, 2000);
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-story-page">
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
              <h2 className="mb-0">Yeni Hikaye Ekle</h2>
              <p className="text-muted mb-0">Falcı için yeni bir hikaye oluşturun</p>
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
                    <strong>Medya Dosyası *</strong>
                  </Form.Label>
                  
                  {!selectedFile ? (
                    <div className="upload-area">
                      <input
                        type="file"
                        id="file-upload"
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="file-upload" className="upload-label">
                        <div className="upload-content">
                          <FaUpload className="upload-icon" />
                          <h5>Dosya Yükle</h5>
                          <p>Resim veya video dosyası seçin</p>
                          <small className="text-muted">
                            Maksimum boyut: 50MB | Video süresi: 15 saniye<br/>
                            <span className="text-warning">Not: Türkçe karakterler otomatik olarak dönüştürülür</span>
                          </small>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="preview-area">
                      <div className="preview-header">
                        <div className="preview-info">
                          <span className="media-type-badge">
                            {mediaType === 'video' ? <FaVideo /> : <FaImage />}
                            {mediaType === 'video' ? 'Video' : 'Resim'}
                          </span>
                          <span className="file-name">{selectedFile.name}</span>
                          {mediaType === 'video' && (
                            <span className="duration-badge">
                              <FaClock className="me-1" />
                              {videoDuration}s
                            </span>
                          )}
                        </div>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={handleRemoveFile}
                        >
                          <FaTrash />
                        </Button>
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
                  )}
                  
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-3">
                      <ProgressBar 
                        now={uploadProgress} 
                        label={`${uploadProgress}%`}
                        variant="primary"
                      />
                    </div>
                  )}
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
                    disabled={loading}
                    className="flex-fill"
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Oluşturuluyor...
                      </>
                    ) : (
                      'Hikaye Oluştur'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => navigate('/stories')}
                    disabled={loading}
                  >
                    İptal
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Bilgi Kartı */}
          <Card className="info-card">
            <Card.Header>
              <h5 className="mb-0">
                <FaEye className="me-2" />
                Hikaye Bilgileri
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="info-item">
                <strong>Medya Tipi:</strong>
                <span className="text-muted">
                  {mediaType === 'video' ? 'Video' : 'Resim'}
                </span>
              </div>
              
              {mediaType === 'video' && (
                <div className="info-item">
                  <strong>Süre:</strong>
                  <span className="text-muted">{videoDuration} saniye</span>
                </div>
              )}
              
              <div className="info-item">
                <strong>Dosya Boyutu:</strong>
                <span className="text-muted">
                  {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Seçilmedi'}
                </span>
              </div>
              
              <div className="info-item">
                <strong>Geçerlilik:</strong>
                <span className="text-muted">24 saat</span>
              </div>
              
              <div className="info-item">
                <strong>Durum:</strong>
                <span className={formData.is_active ? 'text-success' : 'text-muted'}>
                  {formData.is_active ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            </Card.Body>
          </Card>

          {/* Kurallar Kartı */}
          <Card className="rules-card mt-3">
            <Card.Header>
              <h6 className="mb-0">Hikaye Kuralları</h6>
            </Card.Header>
      <Card.Body>
              <ul className="rules-list">
                <li>Maksimum dosya boyutu: 50MB</li>
                <li>Video süresi: 15 saniye</li>
                <li>Desteklenen formatlar: JPG, PNG, GIF, MP4</li>
                <li>Hikayeler 24 saat sonra otomatik olarak silinir</li>
                <li>Uygunsuz içerik yasaktır</li>
              </ul>
      </Card.Body>
    </Card>
        </Col>
      </Row>

      <style>{`
        .add-story-page {
          padding: 20px;
        }
        
        .upload-area {
          border: 2px dashed ${colors.border};
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          background: ${colors.card};
          transition: border-color 0.2s;
          cursor: pointer;
        }
        
        .upload-area:hover {
          border-color: ${colors.primary};
        }
        
        .upload-label {
          cursor: pointer;
          margin: 0;
        }
        
        .upload-content {
          color: ${colors.text.secondary};
        }
        
        .upload-icon {
          font-size: 3rem;
          margin-bottom: 15px;
          color: ${colors.primary};
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
        
        .info-card, .rules-card {
          background: ${colors.card};
          border: 1px solid ${colors.border};
          border-radius: 12px;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid ${colors.border};
        }
        
        .info-item:last-child {
          border-bottom: none;
        }
        
        .rules-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .rules-list li {
          padding: 5px 0;
          color: ${colors.text.secondary};
          font-size: 0.9rem;
          position: relative;
          padding-left: 20px;
        }
        
        .rules-list li:before {
          content: "•";
          color: ${colors.primary};
          font-weight: bold;
          position: absolute;
          left: 0;
        }
      `}</style>
    </div>
  );
};

export default AddStory; 