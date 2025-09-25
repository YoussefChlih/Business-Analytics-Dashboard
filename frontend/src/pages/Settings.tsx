import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Settings: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [settings, setSettings] = useState({
    emailNotifications: true,
    realTimeUpdates: true,
    darkMode: false,
    dataRetention: 90,
  });

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: apiService.getUserProfile,
  });

  React.useEffect(() => {
    if (profile) {
      setProfileData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || '',
      });
    }
  }, [profile]);

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiService.getUsers(),
    enabled: user?.role === 'admin',
  });

  const updateProfileMutation = useMutation({
    mutationFn: apiService.updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      apiService.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProfileUpdate = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleSettingsChange = (setting: string, value: any) => {
    setSettings({ ...settings, [setting]: value });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Profile" />
        <Tab label="Preferences" />
        {user?.role === 'admin' && <Tab label="User Management" />}
        <Tab label="System" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Box display="flex" flexWrap="wrap" gap={3}>
          <Box flex="1 1 400px">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Profile Information
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <TextField
                    label="First Name"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="Last Name"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="Email"
                    value={profileData.email}
                    disabled
                    fullWidth
                    helperText="Email cannot be changed"
                  />
                  <Button 
                    variant="contained" 
                    onClick={handleProfileUpdate}
                    disabled={updateProfileMutation.isPending}
                  >
                    Update Profile
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          <Box flex="1 1 400px">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Information
                </Typography>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    User ID
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {user?.id}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                    Role
                  </Typography>
                  <Chip label={user?.role} color="primary" size="small" />
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                    Member Since
                  </Typography>
                  <Typography variant="body1">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box display="flex" flexWrap="wrap" gap={3}>
          <Box flex="1 1 400px">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notifications
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingsChange('emailNotifications', e.target.checked)}
                      />
                    }
                    label="Email Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.realTimeUpdates}
                        onChange={(e) => handleSettingsChange('realTimeUpdates', e.target.checked)}
                      />
                    }
                    label="Real-time Updates"
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          <Box flex="1 1 400px">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Display & Data
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.darkMode}
                        onChange={(e) => handleSettingsChange('darkMode', e.target.checked)}
                      />
                    }
                    label="Dark Mode"
                  />
                  <TextField
                    label="Data Retention (days)"
                    type="number"
                    value={settings.dataRetention}
                    onChange={(e) => handleSettingsChange('dataRetention', parseInt(e.target.value))}
                    fullWidth
                    helperText="How long to keep historical data"
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {user?.role === 'admin' && (
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Management
              </Typography>
              <List>
                {users?.users?.map((userData: any) => (
                  <ListItem key={userData.id} divider>
                    <ListItemText
                      primary={`${userData.first_name} ${userData.last_name}`}
                      secondary={userData.email}
                    />
                    <ListItemSecondaryAction>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Chip 
                          label={userData.role}
                          color={userData.role === 'admin' ? 'error' : 'default'}
                          size="small"
                        />
                        <Button
                          size="small"
                          onClick={() => updateUserRoleMutation.mutate({
                            id: userData.id,
                            role: userData.role === 'admin' ? 'user' : 'admin'
                          })}
                          disabled={userData.id === user?.id}
                        >
                          Toggle Role
                        </Button>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </TabPanel>
      )}

      <TabPanel value={tabValue} index={user?.role === 'admin' ? 3 : 2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Information
            </Typography>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Application Version
              </Typography>
              <Typography variant="body1" gutterBottom>
                v1.0.0
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                Database Status
              </Typography>
              <Chip label="Connected" color="success" size="small" />
              
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                Redis Status
              </Typography>
              <Chip label="Connected" color="success" size="small" />
              
              <Divider sx={{ my: 2 }} />
              
              <Alert severity="info">
                System monitoring and performance metrics will be available in future updates.
              </Alert>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default Settings;