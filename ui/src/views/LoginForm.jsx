import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Input from '../components/Input';
// { InputPassword }
import { APIError, mfetch, validEmail } from '../helper';
import { loginModalOpened, signupModalOpened, snackAlertError } from '../slices/mainSlice';
import OtpInput from 'react-otp-input';

const LoginForm = ({ isModal = false }) => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [sessionId, setSessionId] = useState('');
  // const [password, setPassword] = useState('');

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const [loginError, setLoginError] = useState(null);

  useEffect(() => {
    setLoginError(null);
  }, [email, otp]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (email === '') {
      setLoginError('Email không được để trống.');
      return;
    } else if (!validEmail(email)) {
      setLoginError('Email không hợp lệ.');
      return;
    }

    // request OTP
    try {
      setOtpSent(true);
      let res = await mfetch('/api/_request_otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        const body = await res.json();
        if (!body.sessionId) {
          setLoginError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
          throw new APIError(500, 'Session ID not found');
        }
        setSessionId(body.sessionId);
        setOtpSent(true);
      } else {
        setLoginError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
        throw new APIError(res.status, await res.json());
      }
    } catch (error) {
      dispatch(snackAlertError(error));
      setOtpSent(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (otp === '') {
      setLoginError('OTP không được để trống.');
      return;
    } else if (otp.length < 4) {
      setLoginError('OTP không hợp lệ.');
      return;
    }

    try {
      let res = await mfetch('/api/_verify_otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          otp,
          email,
          sessionId,
        }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        setLoginError('OTP không hợp lệ.');
      }
    } catch (error) {
      dispatch(snackAlertError(error));
    }
  };

  const emailRef = useRef();
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname === '/login') {
      emailRef.current.focus();
    }
  }, [pathname]);

  const handleOnSignup = (e) => {
    e.preventDefault();
    dispatch(loginModalOpened(false));
    dispatch(signupModalOpened());
  };

  return (
    <form className="login-box modal-card-content" onSubmit={handleLoginSubmit}>
      {/* <InputPassword
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      /> */}
      {!otpSent ? (
        <>
          <Input
            ref={emailRef}
            label="Email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus={isModal}
          />
          {loginError && <div className="form-error text-center">{loginError}</div>}
          <button type="button" className="button button-main" onClick={handleSendOtp}>
            Gửi mã OTP
          </button>
        </>
      ) : (
        <div className="login-box-verify">
          <p className="form-desc" style={{ width: '100%', textAlign: 'center' }}>
            Nhập mã OTP đã được gửi đến email của bạn
          </p>
          <OtpInput
            value={otp}
            onChange={setOtp}
            numInputs={4}
            containerStyle={{
              display: 'flex',
              justifyContent: 'center',
              gap: 8,
            }}
            inputStyle={{
              width: '5rem',
              height: '5rem',
              padding: 10,
              borderRadius: 5,
              fontSize: 24,
              fontWeight: 'bold',
              border: '1px solid #ccc',
            }}
            renderSeparator={<span>-</span>}
            renderInput={(props) => <input {...props} />}
          />
          {loginError && <div className="form-error text-center">{loginError}</div>}
          <input
            type="submit"
            className="button button-main block"
            style={{ width: '100%' }}
            value="Đăng nhập"
          />
        </div>
      )}
      <button className="button-link modal-alt-link" onClick={handleOnSignup}>
        Bạn đã có tài khoản? Đăng ký ngay
      </button>
    </form>
  );
};

LoginForm.propTypes = {
  isModal: PropTypes.bool,
};

export default LoginForm;
