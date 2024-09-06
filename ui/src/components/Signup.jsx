/* eslint-disable react/jsx-no-target-blank */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ButtonClose } from './Button';
import Input, { InputWithCount } from './Input';
import Modal from './Modal';
import { useDispatch } from 'react-redux';
import { loginModalOpened, snackAlert, snackAlertError } from '../slices/mainSlice';
import { APIError, mfetch, validEmail } from '../helper';
import { useDelayedEffect, useInputUsername } from '../hooks';
import { usernameMaxLength } from '../config';
import { useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import SelectOptions from './SelectOptions';
import ReCAPTCHA from 'react-google-recaptcha';

const errors = [
  'Username không được để trống',
  'Password không được để trống',
  'Username quá ngắn.',
  'Email không hợp lệ.',
  'Password too weak.',
  'Repeat password không được để trống',
  'Passwords do not match.',
];

const Signup = ({ open, onClose }) => {
  const dispatch = useDispatch();

  const [username, handleUsernameChange] = useInputUsername(usernameMaxLength);
  const [usernameError, setUsernameError] = useState(null);
  const checkUsernameExists = async () => {
    if (username === '') return true;
    try {
      const res = await mfetch(`/api/users/${username}`);
      if (!res.ok) {
        if (res.status === 404) {
          setUsernameError(null);
          return false;
        }
        throw new APIError(res.status, await res.json());
      }
      setUsernameError(`${username} đã được sử dụng.`);
      return true;
    } catch (error) {
      dispatch(snackAlertError(error));
    }
  };
  useDelayedEffect(checkUsernameExists, [username]);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);

  const [fullName, setFullName] = useState('');
  const [fullNameError, setFullNameError] = useState(null);

  const [phoneCode, setPhoneCode] = useState('+84');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState(null);

  useEffect(() => {
    setFullNameError(null);
  }, [fullName]);

  useEffect(() => {
    setEmailError(null);
  }, [email]);

  useEffect(() => {
    setPhoneError(null);
  }, [phoneNumber]);

  const isCaptchaEnabled = !!CONFIG.captchaSiteKey;
  const captchaRef = useRef();
  const handleCaptchaVerify = (token) => {
    if (!token) {
      dispatch(snackAlert('Đã có lỗi xảy ra. Vui lòng thử lại sau.'));
      return;
    }
    signInUser({ username, email, fullName, phoneCode, phoneNumber });
  };
  const signInUser = async (body) => {
    try {
      const res = await mfetch('/api/_signup_v2', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new APIError(res.status, await res.json());
      window.location.reload();
    } catch (error) {
      dispatch(snackAlertError(error));
    }
  };
  const handleCaptchaError = (error) => {
    dispatch(snackAlertError(error));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errFound = false;
    if (!username) {
      errFound = true;
      setUsernameError(errors[0]);
    } else if (username.length < 4) {
      errFound = true;
      setUsernameError(errors[2]);
    } else if ((await checkUsernameExists()) === true) {
      errFound = true;
    }

    if (!fullName) {
      errFound = true;
      setFullNameError('Họ và tên không được để trống');
    } else if (fullName.length < 10) {
      errFound = true;
      setFullNameError('Họ và tên quá ngắn');
    }

    if (!email) {
      errFound = true;
      setEmailError('Email không được để trống');
    } else if (!validEmail(email)) {
      errFound = true;
      setEmailError(errors[3]);
    }

    if (!phoneNumber) {
      errFound = true;
      setPhoneError('Số điện thoại không được để trống');
    }

    if (errFound) {
      return;
    }
    if (!isCaptchaEnabled) {
      signInUser({ username, email, fullName, phoneCode, phoneNumber });
      return;
    }
    if (!captchaRef.current) {
      dispatch(snackAlertError(new Error('captcha API not found')));
      return;
    }
    captchaRef.current.execute();
  };

  const handleOnLogin = (e) => {
    e.preventDefault();
    onClose();
    dispatch(loginModalOpened());
  };

  return (
    <>
      <Helmet>
        <style>{`.grecaptcha-badge { visibility: hidden; }`}</style>
      </Helmet>
      <Modal open={open} onClose={onClose} noOuterClickClose={false}>
        <div className="modal-card modal-form modal-signup">
          <div className="modal-card-head">
            <div className="modal-card-title">Đăng ký</div>
            <ButtonClose onClick={onClose} />
          </div>
          <form className="modal-card-content" onSubmit={handleSubmit}>
            <InputWithCount
              label="Username"
              maxLength={usernameMaxLength}
              description="Tên người dùng của bạn. Bạn không thể thay đổi sau khi tạo."
              error={usernameError}
              value={username}
              onChange={handleUsernameChange}
              onBlur={checkUsernameExists}
              autoFocus
              style={{ marginBottom: 0 }}
              autoComplete="username"
            />
            <Input
              label="Họ và tên"
              description="Tên đầy đủ của bạn."
              value={fullName}
              error={fullNameError}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              type="email"
              label="Email"
              description="Địa chỉ email của bạn."
              value={email}
              error={emailError}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'end',
                gap: '0.5rem',
                marginBottom: 0,
              }}
            >
              <SelectOptions
                name="phoneCode"
                options={[
                  {
                    id: '+84',
                    text: 'Vietnam (+84)',
                  },
                  {
                    id: '+1',
                    text: 'United States (+1)',
                  },
                ]}
                value={phoneCode}
                onChange={setPhoneCode}
              />
              <Input
                value={phoneNumber}
                error={phoneError}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={{ marginBottom: 0, flex: 1 }}
              />
            </div>
            {isCaptchaEnabled && (
              <div style={{ margin: 0 }}>
                <ReCAPTCHA
                  ref={captchaRef}
                  sitekey={CONFIG.captchaSiteKey}
                  onChange={handleCaptchaVerify}
                  size="invisible"
                  onError={handleCaptchaError}
                />
              </div>
            )}
            <p className="modal-signup-terms">
              {'Bằng cách nhấn vào Đăng ký, bạn đồng ý với '}
              <a target="_blank" href="/terms">
                Điều khoản
              </a>
              {' và '}
              <a target="_blank" href="/privacy-policy">
                {' Chính sách bảo mật'}
              </a>
              .
            </p>
            <p className="modal-signup-terms is-captcha">
              Trang web được bảo vệ bởi reCAPTCHA Google{' '}
              <a href="https://policies.google.com/privacy-policy" target="_blank">
                Chính sách
              </a>{' '}
              và{' '}
              <a href="https://policies.google.com/terms" target="_blank">
                Điều khoản dịch vụ
              </a>
            </p>
            <input type="submit" className="button button-main" value="Đăng ký" />
            <button className="button-link modal-alt-link" onClick={handleOnLogin}>
              Bạn đã có tài khoản? Đăng nhập ngay.
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
};

Signup.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Signup;
