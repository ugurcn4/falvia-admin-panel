import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Row, Col, Image, Alert, Form, ListGroup } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FaArrowLeft, FaEdit, FaHeart, FaComment, FaCalendar, FaUser, FaTrash } from 'react-icons/fa';

const ViewFortuneTellerPost = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('fortune_teller_posts')
        .select(`
          *,
          fortune_tellers (
            id,
            name,
            profile_image,
            bio,
            experience_years,
            specialties
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error('Post yüklenirken hata:', error);
      showAlert('Post yüklenirken hata oluştu', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('fortune_teller_post_comments')
        .select(`
          *,
          users!user_id (
            full_name,
            profile_image
          )
        `)
        .eq('post_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      
      const { data, error } = await supabase
        .from('fortune_teller_post_comments')
        .insert([{
          post_id: id,
          content: newComment.trim(),
          user_id: (await supabase.auth.getUser()).data.user.id
        }])
        .select();

      if (error) throw error;

      setNewComment('');
      await fetchComments();
      showAlert('Yorum başarıyla eklendi', 'success');
    } catch (error) {
      console.error('Yorum eklenirken hata:', error);
      showAlert('Yorum eklenirken hata oluştu', 'danger');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const { error } = await supabase
        .from('fortune_teller_post_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(comments.filter(comment => comment.id !== commentId));
      showAlert('Yorum başarıyla silindi', 'success');
    } catch (error) {
      console.error('Yorum silinirken hata:', error);
      showAlert('Yorum silinirken hata oluştu', 'danger');
    }
  };

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryBadgeVariant = (category) => {
    const variants = {
      'Astroloji': 'primary',
      'Tarot': 'success',
      'Numeroloji': 'info',
      'Palmistry': 'warning',
      'Rüya Yorumu': 'secondary',
      'Genel': 'light',
      'Günlük Burç': 'danger',
      'Aşk Falı': 'danger'
    };
    return variants[category] || 'secondary';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-5">
        <h3>Post bulunamadı</h3>
        <Button onClick={() => navigate('/fortune-teller-posts')}>
          Geri Dön
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🔮 Falcı Postu</h2>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/fortune-teller-posts')}
            className="d-flex align-items-center gap-2"
          >
            <FaArrowLeft /> Geri Dön
          </Button>
          <Button
            variant="outline-warning"
            onClick={() => navigate(`/fortune-teller-posts/edit/${id}`)}
            className="d-flex align-items-center gap-2"
          >
            <FaEdit /> Düzenle
          </Button>
        </div>
      </div>

      {alert.show && (
        <Alert variant={alert.variant} dismissible onClose={() => setAlert({ show: false, message: '', variant: 'success' })}>
          {alert.message}
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          {/* Post İçeriği */}
          <Card className="mb-4">
            {post.image_url && (
              <Card.Img 
                variant="top" 
                src={post.image_url} 
                style={{ height: '300px', objectFit: 'cover' }}
              />
            )}
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h3>{post.title}</h3>
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <Badge bg={getCategoryBadgeVariant(post.category)}>
                        {post.category}
                      </Badge>
                      {post.is_featured && (
                        <Badge bg="warning" text="dark">
                          ⭐ Öne Çıkan
                        </Badge>
                      )}
                    </div>
                    <small className="text-muted d-flex align-items-center">
                      <FaCalendar className="me-1" />
                      {formatDate(post.created_at)}
                    </small>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <small className="text-muted d-flex align-items-center">
                    <FaHeart className="me-1" />
                    {post.likes_count}
                  </small>
                  <small className="text-muted d-flex align-items-center">
                    <FaComment className="me-1" />
                    {post.comments_count}
                  </small>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  {post.fortune_tellers?.profile_image && (
                    <Image
                      src={post.fortune_tellers.profile_image}
                      alt={post.fortune_tellers.name}
                      className="rounded-circle me-2"
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                  )}
                  <div>
                    <strong>{post.fortune_tellers?.name}</strong>
                    <div className="text-muted small">
                      {post.fortune_tellers?.experience_years} yıl deneyim
                    </div>
                  </div>
                </div>
              </div>

              <div className="post-content" style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
                {post.content.split('\n').map((paragraph, index) => (
                  <p key={index} className={paragraph.trim() ? 'mb-3' : 'mb-2'}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Yorumlar */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">Yorumlar ({comments.length})</h5>
            </Card.Header>
            <Card.Body>
              {/* Yorum Ekleme Formu */}
              <Form onSubmit={handleAddComment} className="mb-4">
                <Form.Group>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Yorumunuzu yazın..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={submittingComment}
                  />
                </Form.Group>
                <div className="d-flex justify-content-end mt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!newComment.trim() || submittingComment}
                    size="sm"
                  >
                    {submittingComment ? 'Gönderiliyor...' : 'Yorum Ekle'}
                  </Button>
                </div>
              </Form>

              {/* Yorumlar Listesi */}
              <ListGroup variant="flush">
                {comments.map(comment => (
                  <ListGroup.Item key={comment.id} className="border-0 px-0">
                    <div className="d-flex align-items-start gap-2">
                                              <div className="flex-shrink-0">
                          {comment.users?.profile_image ? (
                            <Image
                              src={comment.users.profile_image}
                              alt="Avatar"
                              className="rounded-circle"
                              style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div 
                              className="rounded-circle d-flex align-items-center justify-content-center"
                              style={{ 
                                width: '32px', 
                                height: '32px', 
                                backgroundColor: '#e9ecef',
                                color: '#6c757d'
                              }}
                            >
                              <FaUser size={14} />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <strong className="d-block">
                                {comment.users?.full_name || 'Anonim Kullanıcı'}
                              </strong>
                            <small className="text-muted">
                              {formatDate(comment.created_at)}
                            </small>
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="d-flex align-items-center gap-1"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                        <p className="mb-0 mt-1">{comment.content}</p>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              {comments.length === 0 && (
                <div className="text-center py-4 text-muted">
                  <p>Henüz yorum yapılmamış</p>
                  <p className="small">İlk yorumu siz yapın!</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Falcı Bilgileri */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">Falcı Hakkında</h6>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-3">
                {post.fortune_tellers?.profile_image && (
                  <Image
                    src={post.fortune_tellers.profile_image}
                    alt={post.fortune_tellers.name}
                    className="rounded-circle mb-2"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                  />
                )}
                <h5>{post.fortune_tellers?.name}</h5>
                <p className="text-muted mb-2">
                  {post.fortune_tellers?.experience_years} yıl deneyim
                </p>
              </div>

              {post.fortune_tellers?.bio && (
                <div className="mb-3">
                  <strong>Hakkında:</strong>
                  <p className="text-muted small mb-0">{post.fortune_tellers.bio}</p>
                </div>
              )}

              {post.fortune_tellers?.specialties && post.fortune_tellers.specialties.length > 0 && (
                <div>
                  <strong>Uzmanlık Alanları:</strong>
                  <div className="mt-1">
                    {post.fortune_tellers.specialties.map((specialty, index) => (
                      <Badge key={index} bg="secondary" className="me-1 mb-1">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Post İstatistikleri */}
          <Card>
            <Card.Header>
              <h6 className="mb-0">Post İstatistikleri</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Beğeni:</span>
                <strong>{post.likes_count}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Yorum:</span>
                <strong>{post.comments_count}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Durum:</span>
                <Badge bg={post.is_published ? 'success' : 'warning'}>
                  {post.is_published ? 'Yayında' : 'Taslak'}
                </Badge>
              </div>
              <div className="d-flex justify-content-between">
                <span>Öne Çıkan:</span>
                <Badge bg={post.is_featured ? 'warning' : 'secondary'}>
                  {post.is_featured ? 'Evet' : 'Hayır'}
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ViewFortuneTellerPost; 