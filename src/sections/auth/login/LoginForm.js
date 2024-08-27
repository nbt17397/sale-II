import { useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Link, Stack, IconButton, InputAdornment, TextField, Checkbox } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import { UserContext, api, getDbName } from 'src/global';
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

export default function LoginForm() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { xhr, setLoading, setUser, showNotification, setTimer } = useContext(UserContext)
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const [nullEmail, setNullEmail] = useState('')
  const [nullPassword, setNullPassword] = useState('')

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      if (event.target.name === 'email') {
        // Nếu người dùng ở ô nhập email, focus xuống ô mật khẩu
        if (email === '') {
          // Hiển thị thông báo rằng trường email không được để trống
          setNullEmail('Vui lòng không để trống tên đăng nhập')
          return;
        }
        setNullEmail('')
        passwordInputRef.current.focus();
      } else if (event.target.name === 'password') {
        // Nếu người dùng ở ô mật khẩu, gọi hàm đăng nhập
        if (password === '') {
          // Hiển thị thông báo rằng trường email không được để trống
          setNullPassword('Vui lòng không để trống mật khẩu')
          return;
        }
        setNullPassword('')
        handleClick();
      }
    }
  };



  const handleClick = async () => {
    setLoading(true)
    const json = await xhr(api.authenticate, {
      db: getDbName(),
      login: email,
      password
    })

    if (json.error) {
      if (json.error.data.name === 'odoo.exceptions.AccessDenied') {
        showNotification('Thông báo', 'Vui lòng kiểm tra lại thông tin đăng nhập',)
        setLoading(false)
        return
      }
      showNotification('', json.error.data.message, 'error')
      setLoading(false)
      return
    }
    setLoading(false)
    setUser(json.result)
    handleSuccessfulLogin()
    const userJSON = JSON.stringify(json.result);
    const psm = JSON.stringify(['account.general.ledger', 'account.account.modify']);

    localStorage.setItem('userKey', userJSON);
    localStorage.setItem('psm', psm);
    // navigate('/app', { replace: true });
    navigate('/chart', { replace: true });

  };


  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSuccessfulLogin = () => {
    const currentLoginTime = new Date().getTime();
    setTimer(currentLoginTime);
    localStorage.setItem('lastLoginTime', currentLoginTime);
    // Tiếp tục các hành động sau khi đăng nhập thành công
  };

  return (
    <>
      <Stack sx={{ backgroundColor: 'white' }} spacing={3}>
        <TextField
          error={!!nullEmail}
          helperText={nullEmail}
          name="email"
          label="Email"
          value={email}
          onChange={handleEmailChange}
          onKeyPress={handleKeyPress}
          // Thêm ref để có thể focus vào ô mật khẩu khi cần
          inputRef={emailInputRef}
        />
        <TextField
          error={!!nullPassword}
          helperText={nullPassword}
          name="password"
          label="Mật khẩu"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          value={password}
          onChange={handlePasswordChange}
          onKeyPress={handleKeyPress}
          // Thêm ref để có thể focus vào nút đăng nhập khi cần
          inputRef={passwordInputRef}
        />

      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        {/* <Checkbox name="remember" label="Remember me" />
        <Link variant="subtitle2" underline="hover">
          Forgot password?
        </Link> */}
      </Stack>

      <LoadingButton sx={{ boxShadow: 'none' }} fullWidth size="large" type="submit" variant="contained" onClick={handleClick}>
        Đăng nhập
      </LoadingButton>
    </>
  );
}
