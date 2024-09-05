import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createCommunityModalOpened } from '../../slices/mainSlice';
import Link from '../../components/Link';
import Sidebar from '../../components/Sidebar';
import PostsFeed from '../../views/PostsFeed';
import WelcomeBanner from '../../views/WelcomeBanner';
import { ButtonClose } from '../../components/Button';
import { isDeviceIos, isDeviceStandalone } from '../../helper';
import { showAppInstallButton } from '../../slices/mainSlice';
import Modal from '../../components/Modal';

const Home = () => {
  const user = useSelector((state) => state.main.user);
  const loggedIn = user !== null;
  const canCreateForum = loggedIn && (user.isAdmin || !CONFIG.disableForumCreation);

  const location = useLocation();
  const feedType = (() => {
    let f = 'all';
    if (loggedIn) {
      f = location.pathname === '/' ? user.homeFeed : location.pathname.substring(1);
    }
    return f;
  })();

  const { show: showInstallPrompt, deferredPrompt } = useSelector(
    (state) => state.main.appInstallButton
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (!isDeviceStandalone()) {
      if ('onbeforeinstallprompt' in window) {
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();
          dispatch(showAppInstallButton(true, e));
        });
        if (window.appData && window.appData.deferredInstallPrompt) {
          dispatch(showAppInstallButton(true, window.appData.deferredInstallPrompt));
        }
      } else {
        // probably iOS
        if (isDeviceIos()) {
          dispatch(showAppInstallButton(true));
        }
      }
    }
  }, []);

  return (
    <div className="page-content page-home wrap page-grid">
      <Sidebar />
      <main className="posts">
        {showInstallPrompt && (
          <div className="banner-install is-m">
            <div className="banner-install-text">
              <p>Tải ứng dụng để có trải nghiệm tốt hơn</p>
            </div>
            <ButtonAppInstall className="banner-install-button" deferredPrompt={deferredPrompt}>
              Cài đặt
            </ButtonAppInstall>
          </div>
        )}
        {loggedIn && (
          <Link className="button button-main home-btn-new-post is-m" to="/new">
            Tạo bài viết
          </Link>
        )}
        {canCreateForum && (
          <>
            <Link
              onClick={() => dispatch(createCommunityModalOpened())}
              className={'button button-main home-btn-new-post is-m'}
            >
              Tạo cộng đồng
            </Link>
          </>
        )}
        <PostsFeed feedType={feedType} />
      </main>
      {/*
      <div className="posts">
        <div className="post-card-compact-list">
          <PostCard initialPost={templatePost} compact={true} />
          <PostCard initialPost={templatePost} compact={true} />
          <PostCard initialPost={templatePost} compact={true} />
        </div>
      </div>*/}
      <aside className="sidebar-right is-custom-scrollbar is-v2'">
        <WelcomeBanner />
      </aside>
    </div>
  );
};

export default Home;

export const ButtonAppInstall = ({ deferredPrompt, children, ...props }) => {
  const [showIosModal, setShowIosModal] = useState(false);
  const handleIosModalClose = () => setShowIosModal(false);

  const handleClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
    } else {
      // show iOS modal
      setShowIosModal(true);
    }
  };

  return (
    <>
      <button {...props} onClick={handleClick}>
        {children}
      </button>
      <Modal open={showIosModal} onClose={handleIosModalClose}>
        <div className="modal-card is-compact-mobile modal-ios-install">
          <div className="modal-card-head">
            <div className="modal-card-title">Các bước trên iOS</div>
            <ButtonClose onClick={handleIosModalClose} />
          </div>
          <div className="modal-card-content">
            <div className="modal-ios-install-steps">
              <ol>
                <li>1. Chọn nút chia sẻ Safari.</li>
                <li>2. Chọn mục &quot;Thêm vào màn hình chính.&quot;</li>
                <li>3. Chọn &quot;Thêm.&quot;</li>
              </ol>
              <p>Lưu ý rằng các ứng dụng web trên iOS chỉ có thể được cài đặt bằng Safari.</p>
            </div>
          </div>
          <div className="modal-card-actions">
            <button onClick={handleIosModalClose}>Close</button>
          </div>
        </div>
      </Modal>
    </>
  );
};

ButtonAppInstall.propTypes = {
  deferredPrompt: PropTypes.object,
  children: PropTypes.node.isRequired,
};
