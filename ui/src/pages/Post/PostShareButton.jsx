import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { copyToClipboard } from '../../helper';
import { snackAlert } from '../../slices/mainSlice';
import Dropdown from '../../components/Dropdown';

const Target = ({ isHiddenIcon = false, ...props }) => {
  return (
    <div className="button button-text button-with-icon post-card-button-with-icon" {...props}>
      {!isHiddenIcon && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="17"
          height="14"
          viewBox="0 0 17 14"
          fill="none"
          style={{
            '--button-icon-size': '16px',
          }}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16 7L9 1V5.033C5.219 5.033 1 6.5 1 13C2.969 9.812 6 9 9 9V13L16 7Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <span>Chia sẻ</span>
    </div>
  );
};

Target.propTypes = {
  isHiddenIcon: PropTypes.bool,
};

const PostShareButton = ({ isHiddenIcon, post }) => {
  const dispatch = useDispatch();

  const url = `${window.location.origin}/${post.communityName}/post/${post.publicId}`;
  const handleCopyURL = () => {
    let text = 'Failed to copy link to clipboard.';
    if (copyToClipboard(url)) {
      text = 'Link copied to clipboard.';
    }
    dispatch(snackAlert(text, 'pl_copied'));
  };

  const hasMoreShareableOptions = window.innerWidth < 1171 && Boolean(navigator.share);
  const handleMoreButtonClick = async () => {
    try {
      await navigator.share({
        title: post.title,
        url,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const renderImageDownloadButton = () => {
    if (post.images.length === 0) {
      return (
        <div className="button-clear dropdown-item" style={{ opacity: 'var(--disabled-opacity)' }}>
          Download image
        </div>
      );
    }

    const image = post.images[post.imageGalleryIndex];
    const url = image.url;
    const filename = `discuit-${post.communityName}[${post.publicId}]-${
      post.imageGalleryIndex + 1
    }.${image.format}`;
    return (
      <a href={url} className="button-clear dropdown-item" download={filename}>
        Download image
      </a>
    );
  };

  const twitterText = `"${post.title}" ${url}`;

  return (
    <Dropdown target={<Target isHiddenIcon={isHiddenIcon} />}>
      <div className="dropdown-list">
        <a
          className="button-clear dropdown-item"
          target="_blank"
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`}
          rel="noreferrer"
        >
          To Twitter / X
        </a>
        <a
          className="button-clear dropdown-item"
          target="_blank"
          href={`https://www.facebook.com/sharer.php?u=${url}`}
          rel="noreferrer"
        >
          To Facebook
        </a>
        <button className="button-clear dropdown-item" onClick={handleCopyURL}>
          Copy URL
        </button>
        {post.type === 'image' && renderImageDownloadButton()}
        {hasMoreShareableOptions && (
          <button className="button-clear dropdown-item" onClick={handleMoreButtonClick}>
            More
          </button>
        )}
      </div>
    </Dropdown>
  );
};

PostShareButton.propTypes = {
  isHiddenIcon: PropTypes.bool,
  post: PropTypes.object.isRequired,
};

export default PostShareButton;
