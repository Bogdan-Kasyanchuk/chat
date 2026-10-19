import { showError } from '@/lib';

const cloudinaryImageUpload = async (loadAvatar: File) => {
  const data = new FormData();
  data.append('file', loadAvatar);
  data.append('upload_preset', import.meta.env.VITE_UPLOAD_PRESET);
  data.append('cloud_name', import.meta.env.VITE_CLOUD_NAME);
  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: data,
      },
    );
    const { url } = await res.json();
    return url;
  } catch (error) {
    showError(error);
  }
};

export default cloudinaryImageUpload;
