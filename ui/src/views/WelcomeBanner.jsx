import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { createCommunityModalOpened, signupModalOpened } from '../slices/mainSlice';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { SvgLogo } from '../components/svg/logo';

const WelcomeBanner = ({ className, children, hideIfMember = false, ...props }) => {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.main.user);
  const loggedIn = user !== null;

  const usersCount = useSelector((state) => state.main.noUsers);

  if (hideIfMember && loggedIn) {
    return null;
  }

  const canCreateForum = loggedIn && (user.isAdmin || !CONFIG.disableForumCreation);

  return (
    <div
      className={
        'card card-sub card-padding home-welcome' +
        // (!loggedIn ? ' is-guest' : '') +
        (className ? ` ${className}` : '')
      }
      {...props}
    >
      <div className="home-welcome-text">
        <div className="home-welcome-join">
          <span>Tham gia</span> <SvgLogo />
        </div>
        <div className="home-welcome-subtext">
          Khám phá nơi tốt nhất để tìm những thứ thú vị và thảo luận về mọi thứ.
        </div>
      </div>
      <div className="home-welcome-buttons">
        {loggedIn && (
          <Link
            to="/new"
            className="button button-main"
            style={{
              paddingTop: '14px',
              paddingBottom: '14px',
            }}
          >
            Đăng bài
          </Link>
        )}
        {canCreateForum && (
          <>
            <button
              onClick={() => dispatch(createCommunityModalOpened())}
              className={'button' + (loggedIn ? ' button-main' : '')}
              style={{
                paddingTop: '14px',
                paddingBottom: '14px',
              }}
            >
              Tạo cộng đồng
            </button>
          </>
        )}
        <>{children}</>
        {!loggedIn && (
          <button
            className="button-main"
            style={{
              paddingTop: '14px',
              paddingBottom: '14px',
            }}
            onClick={() => dispatch(signupModalOpened())}
          >
            Tạo tài khoản
          </button>
        )}
      </div>
    </div>
  );
};

WelcomeBanner.propTypes = {
  className: PropTypes.string,
  children: PropTypes.element,
  hideIfMember: PropTypes.bool,
};

export default WelcomeBanner;
