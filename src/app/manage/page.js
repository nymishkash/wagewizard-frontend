'use client';

import { useState, useEffect } from 'react';
import { wwAPI } from '@/utils/api_instance';
import {
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Modal,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Edit,
  Search,
  X,
  Save,
  UserPlus,
  RefreshCw,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

const ManagePage = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    designation: '',
    base_pay: '',
    other_pay: '',
    doj: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const fetchEmployees = async (query = null) => {
    try {
      setLoading(true);
      const companyId = localStorage.getItem('companyId');
      const token = localStorage.getItem('token');

      const response = await wwAPI.post(
        '/employees/all',
        {
          companyId,
          search: query,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.employees) {
        setEmployees(response.data.employees);
        setFilteredEmployees(response.data.employees);
        if (query) {
          showSnackbar('Search completed successfully', 'success');
        }
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      showSnackbar('Failed to fetch employees', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchEmployees(query);
  };

  const handleOpenModal = (employee = null) => {
    if (employee) {
      setCurrentEmployee(employee);
      setIsAddingEmployee(false);
      setFormData({
        firstname: employee.firstname || '',
        lastname: employee.lastname || '',
        designation: employee.designation || '',
        base_pay: employee.base_pay || '',
        other_pay: employee.other_pay || '',
        doj: employee.doj
          ? new Date(employee.doj).toISOString().split('T')[0]
          : '',
      });
    } else {
      setCurrentEmployee(null);
      setIsAddingEmployee(true);
      setFormData({
        firstname: '',
        lastname: '',
        designation: '',
        base_pay: '',
        other_pay: '',
        doj: '',
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentEmployee(null);
    setIsAddingEmployee(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSaveEmployee = async () => {
    try {
      const companyId = localStorage.getItem('companyId');
      const token = localStorage.getItem('token');

      if (isAddingEmployee) {
        await wwAPI.post(
          '/employees/create',
          {
            companyId,
            ...formData,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        showSnackbar('Employee added successfully', 'success');
      } else {
        await wwAPI.post(
          '/employees/update',
          {
            employeeId: currentEmployee.id,
            companyId,
            ...formData,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        showSnackbar('Employee updated successfully', 'success');
      }

      handleCloseModal();
      fetchEmployees(searchQuery);
    } catch (error) {
      console.error(
        `Failed to ${isAddingEmployee ? 'add' : 'update'} employee:`,
        error
      );
      showSnackbar(
        `Failed to ${isAddingEmployee ? 'add' : 'update'} employee`,
        'error'
      );
    }
  };

  const openDeleteModal = (employeeId) => {
    setEmployeeToDelete(employeeId);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setEmployeeToDelete(null);
  };

  const handleDeleteEmployee = async () => {
    try {
      const companyId = localStorage.getItem('companyId');
      const token = localStorage.getItem('token');

      await wwAPI.post(
        '/employees/delete',
        {
          employeeId: employeeToDelete,
          companyId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      closeDeleteModal();
      fetchEmployees(searchQuery);
      showSnackbar('Employee deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete employee:', error);
      showSnackbar('Failed to delete employee', 'error');
    }
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 450,
    bgcolor: 'background.paper',
    borderRadius: '12px',
    boxShadow: 24,
    p: 4,
  };

  const deleteModalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: '12px',
    boxShadow: 24,
    p: 4,
  };

  return (
    <div>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <div className="min-h-screen bg-slate-200 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-start items-center mb-6">
            <div className="mr-4">
              <Typography variant="h4" className="font-semibold text-gray-800">
                Employee Directory
              </Typography>
            </div>
            <div>
              <Button
                variant="contained"
                startIcon={<UserPlus size={18} />}
                style={{
                  backgroundColor: '#333333',
                  color: '#ffffff',
                }}
                onClick={() => handleOpenModal()}
              >
                Add Employee
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 mb-6">
              <Search size={20} className="text-gray-500 mr-2" />
              <TextField
                fullWidth
                variant="standard"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={handleSearch}
                InputProps={{
                  disableUnderline: true,
                }}
              />
            </div>

            {loading ? (
              <div className="py-20">
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="h-10 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                      <div className="h-10 bg-gray-200 rounded w-1/6 animate-pulse"></div>
                      <div className="h-10 bg-gray-200 rounded w-1/6 animate-pulse"></div>
                      <div className="h-10 bg-gray-200 rounded w-1/6 animate-pulse"></div>
                      <div className="h-10 bg-gray-200 rounded w-1/6 animate-pulse"></div>
                      <div className="h-10 bg-gray-200 rounded w-1/6 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-20">
                <Typography variant="h6" className="text-gray-500 mb-2">
                  No employees found
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<RefreshCw size={16} />}
                  onClick={() => fetchEmployees()}
                  style={{ borderColor: '#333333', color: '#333333' }}
                >
                  Refresh
                </Button>
              </div>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell className="font-semibold">Name</TableCell>
                      <TableCell className="font-semibold">
                        Designation
                      </TableCell>
                      <TableCell className="font-semibold">Base Pay</TableCell>
                      <TableCell className="font-semibold">Other Pay</TableCell>
                      <TableCell className="font-semibold">Total</TableCell>
                      <TableCell className="font-semibold">Join Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee.id} hover>
                        <TableCell>{`${employee.firstname} ${employee.lastname}`}</TableCell>
                        <TableCell>{employee.designation}</TableCell>
                        <TableCell>${employee.base_pay}</TableCell>
                        <TableCell>${employee.other_pay || '0'}</TableCell>
                        <TableCell>
                          $
                          {parseFloat(employee.base_pay || 0) +
                            parseFloat(employee.other_pay || 0)}
                        </TableCell>
                        <TableCell>
                          {employee.doj
                            ? new Date(employee.doj).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell align="right">
                          <div className="flex justify-end">
                            <IconButton
                              onClick={() => handleOpenModal(employee)}
                              className="text-gray-800 hover:bg-gray-100"
                            >
                              <Edit size={18} />
                            </IconButton>
                            <IconButton
                              onClick={() => openDeleteModal(employee.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </div>
        </div>

        <Modal
          open={modalOpen}
          onClose={handleCloseModal}
          aria-labelledby="employee-modal"
        >
          <Box sx={modalStyle}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <Typography
                variant="h6"
                component="h2"
                className="font-semibold text-black"
              >
                {isAddingEmployee ? 'Add Employee' : 'Edit Employee'}
              </Typography>
              <IconButton
                onClick={handleCloseModal}
                size="small"
                className="hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </IconButton>
            </div>

            <div className="space-y-5 px-1">
              <div className="grid grid-cols-2 gap-5">
                <TextField
                  label="First Name"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  margin="normal"
                  className="mb-1"
                />
                <TextField
                  label="Last Name"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  margin="normal"
                  className="mb-1"
                />
              </div>

              <TextField
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                fullWidth
                size="small"
                margin="normal"
                className="mb-1"
              />

              <div className="grid grid-cols-2 gap-5 mt-3">
                <TextField
                  label="Base Pay"
                  name="base_pay"
                  type="number"
                  value={formData.base_pay}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  margin="normal"
                  className="mb-1"
                />
                <TextField
                  label="Other Pay"
                  name="other_pay"
                  type="number"
                  value={formData.other_pay}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  margin="normal"
                  className="mb-1"
                />
              </div>

              <TextField
                label="Date of Joining"
                name="doj"
                type="date"
                value={formData.doj}
                onChange={handleInputChange}
                fullWidth
                size="small"
                margin="normal"
                className="mb-1 mt-3"
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <div className="flex justify-end space-x-4 mt-8 pt-4 border-t border-gray-200">
                <div>
                  <Button
                    variant="outlined"
                    onClick={handleCloseModal}
                    style={{ borderColor: '#cccccc', color: '#333333' }}
                    className="py-2"
                  >
                    Cancel
                  </Button>
                </div>
                <div>
                  <Button
                    variant="contained"
                    onClick={handleSaveEmployee}
                    startIcon={<Save size={16} />}
                    style={{
                      backgroundColor: '#333333',
                      color: '#ffffff',
                    }}
                    className="pr-2 py-2"
                  >
                    {isAddingEmployee ? 'Add Employee' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </div>
          </Box>
        </Modal>

        <Modal
          open={deleteModalOpen}
          onClose={closeDeleteModal}
          aria-labelledby="delete-modal"
        >
          <Box sx={deleteModalStyle}>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <AlertTriangle size={28} className="text-red-600" />
              </div>
              <Typography
                variant="h6"
                component="h2"
                className="font-semibold text-black mb-2"
              >
                Delete Employee
              </Typography>
              <Typography variant="body1" className="text-gray-600">
                Are you sure you want to delete this employee? This action
                cannot be undone.
              </Typography>
            </div>

            <div className="flex justify-center space-x-4 pt-2">
              <div>
                <Button
                  variant="outlined"
                  onClick={closeDeleteModal}
                  style={{ borderColor: '#cccccc', color: '#333333' }}
                  className="py-2 px-4"
                >
                  Cancel
                </Button>
              </div>
              <div>
                <Button
                  variant="contained"
                  onClick={handleDeleteEmployee}
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                  }}
                  className="py-2 px-4"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default ManagePage;
