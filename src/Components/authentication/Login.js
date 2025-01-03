import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Replace with your actual logo and image imports
import logo from '../../Assets/images/logo.png';
import i1 from '../../Assets/login/i1';
import i2 from '../../Assets/images/i2.jpg';
import i3 from '../../Assets/login/i3';

const LoginPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [errMsg, setErrMsg] = useState('');
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // Fetch user data
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://dummyjson.com/users');
        setUsers(response.data.users);
        console.log(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();

    // Set up slider interval
    const sliderInterval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % 3);
    }, 3000);

    // Clean up interval on component unmount
    return () => clearInterval(sliderInterval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = (data) => {
    const errors = {};

    if (!data.username) {
      errors.username = 'Username is required!';
    } else if (data.username.length > 15) {
      errors.username = 'Username should have max 15 characters!';
    }

    if (!data.password) {
      errors.password = 'Password is required!';
    } else if (data.password.length > 10) {
      errors.password = 'Password should have max 10 characters!';
    }

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validateForm(formData);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Authenticate user
      const user = users.find(
        (u) =>
          u.username === formData.username &&
          u.password === formData.password
      );

      if (user) {
        sessionStorage.setItem('username', user.username);
        navigate('/dashboard');
      } else {
        setErrMsg('Invalid username or password!');
      }
    } else {
      console.log('Please enter valid data!');
    }
  };

  const slides = [
    {
      image: i1,
    },
    {
      image: i2,
    },
    {
      image: i3,
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        <img src={logo} alt="Logo" style={{ width: '150px', marginBottom: '2rem', marginLeft: '10rem' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <img
            src={slides[currentSlide].image}
            alt={`Slide ${currentSlide + 1}`}
            style={{ width: '100%', maxWidth: '400px', marginBottom: '1rem' , marginLeft:'3rem'}}
          />
        </div>
      </div>
      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          <h1 style={styles.title}>Sign in</h1>
          <p style={styles.subtitle}>Enter your email address and password to access the admin panel.</p>

          {errMsg && <p style={styles.errorMessage}>{errMsg}</p>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>User Name</label>
              <input
                type="text"
                name="username"
                placeholder="Enter User Name.."
                value={formData.username}
                onChange={handleChange}
                style={styles.input}
              />
              {errors.username && <p style={styles.errorText}>{errors.username}</p>}
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.passwordHeader}>
                <label style={styles.label}>Password</label>
                <a href="/forgot-password" style={styles.forgotPassword}>
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                name="password"
                placeholder="Enter Password.."
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
              />
              {errors.password && <p style={styles.errorText}>{errors.password}</p>}
            </div>

            <div style={styles.rememberMeContainer}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={styles.checkbox}
                />
                Remember Me
              </label>
              <button type="submit" style={styles.signInButton}>
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '90vh',
    backgroundColor: '#f5f5f5',
    margin: '20px 20px',
  },
  leftPanel: {
    flex: '1',
    backgroundColor: '#00A19C',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    borderRadius: '40px',
  },
  rightPanel: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  formContainer: {
    width: '100%',
    maxWidth: '400px',
    padding: '20px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '10px',
  },
  subtitle: {
    color: '#666',
    marginBottom: '30px',
  },
  errorMessage: {
    color: 'red',
    marginBottom: '10px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#333',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
  },
  passwordHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  forgotPassword: {
    color: '#00A19C',
    textDecoration: 'none',
    fontSize: '14px',
  },
  rememberMeContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    color: '#666',
    fontSize: '14px',
  },
  checkbox: {
    marginRight: '8px',
  },
  signInButton: {
    backgroundColor: '#00A19C',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '10px 30px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  errorText: {
    color: 'red',
    fontSize: '12px',
    marginTop: '5px',
  },
};

export default LoginPage;
