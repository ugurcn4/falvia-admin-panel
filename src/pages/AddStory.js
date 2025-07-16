import React from 'react';
import { Card } from 'react-bootstrap';

const AddStory = () => {
  return (
    <Card className="bg-card">
      <Card.Body>
        <h3 className="text-light">➕ Yeni Hikaye Ekle</h3>
        <p className="text-muted">Bu sayfa yakında eklenecek...</p>
      </Card.Body>
    </Card>
  );
};

export default AddStory; 