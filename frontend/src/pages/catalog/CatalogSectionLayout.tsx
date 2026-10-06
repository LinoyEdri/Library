import { Link as RouterLink, Outlet } from 'react-router';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useCatalogSectionTabs } from './hooks/useCatalogSectionTabs';

// Books, authors, categories and publishers share one section with tabs on top
export function CatalogSectionLayout() {
  const { tabs, selectedTab } = useCatalogSectionTabs();

  return (
    <>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 3,
        }}
      >
        <Tabs
          value={selectedTab}
          variant="scrollable"
          allowScrollButtonsMobile
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.path}
              label={tab.label}
              value={tab.path}
              component={RouterLink}
              to={tab.path}
            />
          ))}
        </Tabs>
      </Box>

      <Outlet />
    </>
  );
}
