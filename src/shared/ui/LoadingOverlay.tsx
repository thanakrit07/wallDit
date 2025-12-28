import { LoadingOverlay as MantineLoadingOverlay, type LoadingOverlayProps, Box } from '@mantine/core';

interface CustomLoadingOverlayProps extends LoadingOverlayProps {
  children?: React.ReactNode;
}

export function LoadingOverlay({ children, visible, ...props }: CustomLoadingOverlayProps) {
  return (
    <Box pos="relative">
      {children}
      <MantineLoadingOverlay
        visible={visible}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: 'blue', type: 'bars' }}
        {...props}
      />
    </Box>
  );
}