export const getImg = (id: number) => `http://localhost:3004/images/product/product-${((id - 1) % 100) + 1}.jpg`;
export const getQuadImages = (startId: number) => [getImg(startId), getImg(startId + 1), getImg(startId + 2), getImg(startId + 3)];
