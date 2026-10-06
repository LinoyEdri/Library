import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useBookCoverImage } from './hooks/useBookCoverImage';

type BookCoverImageProps = {
  imageUrl: string;
  title: string;
  height: number;
};

// The cover picture; a built-in cover (icon + title) when there is no image or it fails to load
export function BookCoverImage({ imageUrl, title, height }: BookCoverImageProps) {
  const { shouldShowPlaceholder, handleImageError } = useBookCoverImage(imageUrl);

  if (shouldShowPlaceholder) {
    return (
      <Box
        aria-label={title}
        role="img"
        sx={{
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          px: 2,
          bgcolor: 'primary.main',
          color: 'warning.main',
          textAlign: 'center',
        }}
      >
        <MenuBookIcon
          sx={{
            fontSize: height / 4,
          }}
        />

        <Typography
          variant="h6"
          component="span"
          sx={{
            color: 'primary.contrastText',
          }}
        >
          {title}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={imageUrl}
      alt={title}
      loading="lazy"
      onError={handleImageError}
      sx={{
        width: '100%',
        height,
        objectFit: 'cover',
        display: 'block',
      }}
    />
  );
}
