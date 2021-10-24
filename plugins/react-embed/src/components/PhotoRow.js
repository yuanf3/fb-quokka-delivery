import React from "react";
import { Col, Image, Row } from "react-bootstrap";

/**
 * component: A formated row of photos.
 *
 * props:
 * - photos (array): links to the photos
 * - rowHeight (integer): height of the row in pixels
 */
const PhotoRow = ({ photos, rowHeight }) => {
  return (
    <Row>
      {photos.map((photo, index) => {
        return (
          <Col sm className="p-1">
            <Image
              src={photo}
              alt={index}
              style={{
                maxHeight: `${rowHeight}px`,
                objectFit: "cover",
              }}
              className="w-100"
            />
          </Col>
        );
      })}
    </Row>
  );
};

const formatPhotos = (photos) => {
  const numPhotos = photos.length;
  const numNotShown = numPhotos - 5;
  switch (numPhotos) {
    case 0: // 0 photos
      return;
    case 1: // 1 photo = 1 row
      return <PhotoRow photos={photos} rowHeight={535} />;
    case 2: // 2 photos = 1 row
      return <PhotoRow photos={photos} rowHeight={210} />;
    case 3:
    case 4: // 3 or 4 photos = 2 rows
      return (
        <>
          <PhotoRow photos={photos.slice(0, 1)} rowHeight={210} />
          <PhotoRow photos={photos.slice(1)} rowHeight={150} />
        </>
      );
    default:
      // 5 or more photos = 2 rows, only show the first 5 photos + a label
      return (
        <>
          <PhotoRow photos={photos.slice(0, 2)} rowHeight={210} />
          <PhotoRow photos={photos.slice(2, 5)} rowHeight={150} />
          {numNotShown > 0 &&
            `+${numNotShown} photo${numNotShown === 1 ? "" : "s"}`}
        </>
      );
  }
};

export default PhotoRow;
export { formatPhotos };
