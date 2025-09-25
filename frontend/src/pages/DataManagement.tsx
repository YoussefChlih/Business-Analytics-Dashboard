import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/apiService';

const DataManagement: React.FC = () => {
  const [openSourceDialog, setOpenSourceDialog] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tableName, setTableName] = useState('');
  const [newSource, setNewSource] = useState({
    name: '',
    type: 'database',
    connectionConfig: {},
  });

  const queryClient = useQueryClient();

  const { data: dataSources } = useQuery({
    queryKey: ['data-sources'],
    queryFn: apiService.getDataSources,
  });

  const createSourceMutation = useMutation({
    mutationFn: apiService.createDataSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-sources'] });
      setOpenSourceDialog(false);
      setNewSource({ name: '', type: 'database', connectionConfig: {} });
    },
  });

  const uploadCSVMutation = useMutation({
    mutationFn: ({ file, tableName }: { file: File; tableName: string }) =>
      apiService.uploadCSV(file, tableName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-sources'] });
      setOpenUploadDialog(false);
      setSelectedFile(null);
      setTableName('');
    },
  });

  const handleCreateSource = () => {
    createSourceMutation.mutate(newSource);
  };

  const handleUploadCSV = () => {
    if (selectedFile && tableName) {
      uploadCSVMutation.mutate({ file: selectedFile, tableName });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-suggest table name based on file name
      const nameWithoutExt = file.name.split('.')[0];
      setTableName(nameWithoutExt.toLowerCase().replace(/[^a-z0-9]/g, '_'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {        
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Data Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setOpenUploadDialog(true)}
          >
            Upload CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenSourceDialog(true)}
          >
            Add Data Source
          </Button>
        </Box>
      </Box>

      <Box>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Data Sources
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Sync</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataSources?.map((source: any) => (
                    <TableRow key={source.id}>
                      <TableCell>{source.name}</TableCell>
                      <TableCell>
                        <Chip label={source.type} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={source.status} 
                          color={getStatusColor(source.status) as any}
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        {source.last_sync ? new Date(source.last_sync).toLocaleString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <SyncIcon />
                        </IconButton>
                        <IconButton size="small">
                          <DownloadIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!dataSources || dataSources.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No data sources found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        <Box display="flex" flexWrap="wrap" gap={3} mt={3}>
          <Box flex="1 1 300px">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Data Quality Metrics
                </Typography>
                <Box>
                  <Box display="flex" justifyContent="space-between" py={1}>
                    <Typography variant="body2">Completeness</Typography>
                    <Typography variant="body2" color="success.main">
                      95.2%
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" py={1}>
                    <Typography variant="body2">Accuracy</Typography>
                    <Typography variant="body2" color="warning.main">
                      87.5%
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" py={1}>
                    <Typography variant="body2">Consistency</Typography>
                    <Typography variant="body2" color="success.main">
                      92.1%
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" py={1}>
                    <Typography variant="body2">Validity</Typography>
                    <Typography variant="body2" color="error.main">
                      78.3%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box flex="2 1 500px">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Data Operations
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  ETL processes and data transformations will appear here
                </Alert>
                <Typography variant="body2" color="text.secondary">
                  No recent operations to display
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Add Data Source Dialog */}
      <Dialog open={openSourceDialog} onClose={() => setOpenSourceDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Data Source</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Name"
              value={newSource.name}
              onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={newSource.type}
                label="Type"
                onChange={(e) => setNewSource({ ...newSource, type: e.target.value })}
              >
                <MenuItem value="database">Database</MenuItem>
                <MenuItem value="api">API</MenuItem>
                <MenuItem value="file">File</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
              </Select>
            </FormControl>
            <Alert severity="info">
              Connection configuration will be implemented based on the selected type
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSourceDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateSource} 
            variant="contained"
            disabled={!newSource.name || createSourceMutation.isPending}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload CSV Dialog */}
      <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload CSV File</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              fullWidth
            >
              Choose CSV File
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            {selectedFile && (
              <Alert severity="success">
                Selected: {selectedFile.name}
              </Alert>
            )}
            <TextField
              label="Table Name"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              fullWidth
              helperText="Name for the table to store CSV data"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleUploadCSV} 
            variant="contained"
            disabled={!selectedFile || !tableName || uploadCSVMutation.isPending}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataManagement;