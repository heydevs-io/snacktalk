import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { createCommunityModalOpened, signupModalOpened } from '../slices/mainSlice';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

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
        <div className="home-welcome-join">Join the discussion</div>
        <div className="home-welcome-subtext">
          Discuit is a place where <span>{usersCount}</span> people get together to find cool stuff
          and discuss things.
        </div>
      </div>
      <div className="home-welcome-buttons">
        {loggedIn && (
          <Link to="/new" className={'button' + (loggedIn ? ' button-main' : '')}>
            Create post
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
