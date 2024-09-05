/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Link from '../Link';
import { omitWWWFromHostname, stringCount } from '../../helper';
import MarkdownBody from '../MarkdownBody';
import ShowMoreBox from '../ShowMoreBox';
import PostVotes from './PostVotes';
import PostCardHeadingDetails from './PostCardHeadingDetails';
import Image from './Image';
import LinkImage from './LinkImage';
import { useIsMobile } from '../../hooks';
import getEmbedComponent from './embed';
import PostImageGallery from '../PostImageGallery';
import PostShareButton from '../../pages/Post/PostShareButton';
import CommentIcon from '../svg/icons/comment';

const PostCard = ({
  index = 100, // index in feed
  initialPost,
  hideVoting = false,
  openInTab = false,
  compact = false,
  inModTools = false,
  disableEmbeds = false,
  onRemoveFromList = null,
}) => {
  const history = useHistory();

  const [post, setPost] = useState(initialPost);
  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  const postURL = `/${post.communityName}/post/${post.publicId}`;
  const target = openInTab ? '_blank' : '_self';
  const disabled = inModTools || post.locked;

  const handlePostCardClick = (e, target = '_blank') => {
    let isButtonClick = false;
    let el = e.target;
    while (el && !el.classList.contains('post-card-card')) {
      if (el.nodeName === 'BUTTON' || el.nodeName === 'A' || el.classList.contains('is-button')) {
        isButtonClick = true;
        break;
      }
      el = el.parentElement;
      if (!el.parentElement) isButtonClick = true; // Clicked somewhere outside .post-card-card.
    }
    if (!isButtonClick) {
      if (target !== '_self') {
        window.open(postURL);
      } else {
        history.push(postURL);
      }
    }
  };

  const handleAuxClick = (e) => {
    // mouse middle button
    if (e.button === 1) {
      handlePostCardClick(e, '_blank');
    }
  };

  const [isDomainHovering, setIsDomainHovering] = useState(false);

  const isMobile = useIsMobile();
  const isPinned = post.isPinned || post.isPinnedSite;
  const showLink = !post.deletedContent && post.type === 'link';

  const { isEmbed: _isEmbed, render: Embed, url: embedURL } = getEmbedComponent(post.link);
  const isEmbed = !disableEmbeds && _isEmbed;

  const showImage = !post.deletedContent && post.type === 'image' && post.image;
  const imageLoadingStyle = index < 3 ? 'eager' : 'lazy';

  return (
    <div
      className={
        'post-card' +
        (inModTools ? ' is-in-modtools' : '') +
        (hideVoting ? ' no-voting' : '') +
        (compact ? ' is-compact' : '') +
        (isPinned ? ' is-pinned' : '')
      }
    >
      <div
        className="card post-card-card"
        onClick={(e) => handlePostCardClick(e, target)}
        onAuxClick={handleAuxClick}
      >
        <div className="post-card-heading">
          <PostCardHeadingDetails post={post} target={target} onRemoveFromList={onRemoveFromList} />
        </div>
        <div className={'post-card-body' + (isDomainHovering ? ' is-domain-hover' : '')}>
          <div className="post-card-title">
            <div className="post-card-title-text">
              <Link className="post-card-title-main" to={postURL} target={target}>
                {post.title}
              </Link>
              {showLink && (
                <a
                  className="post-card-link-domain"
                  href={post.link.url}
                  target="_blank"
                  rel="nofollow noreferrer"
                  onMouseEnter={() => setIsDomainHovering(true)}
                  onMouseLeave={() => setIsDomainHovering(false)}
                >
                  <span>{omitWWWFromHostname(post.link.hostname)}</span>
                  <svg
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    width="16px"
                    height="16px"
                  >
                    <path d="M 9 2 L 9 3 L 12.292969 3 L 6.023438 9.273438 L 6.726563 9.976563 L 13 3.707031 L 13 7 L 14 7 L 14 2 Z M 4 4 C 2.894531 4 2 4.894531 2 6 L 2 12 C 2 13.105469 2.894531 14 4 14 L 10 14 C 11.105469 14 12 13.105469 12 12 L 12 7 L 11 8 L 11 12 C 11 12.550781 10.550781 13 10 13 L 4 13 C 3.449219 13 3 12.550781 3 12 L 3 6 C 3 5.449219 3.449219 5 4 5 L 8 5 L 9 4 Z" />
                  </svg>
                </a>
              )}
            </div>
            {showLink && !isEmbed && post.link.image && (
              <Link className="post-card-link-image" to={postURL} target={target}>
                <LinkImage link={post.link} loading={imageLoadingStyle} />
              </Link>
            )}
          </div>
          {isEmbed && <Embed url={embedURL} />}
          {post.type === 'text' && (
            <div className="post-card-text">
              <ShowMoreBox maxHeight="200px">
                <MarkdownBody noLinks>{post.body}</MarkdownBody>
              </ShowMoreBox>
            </div>
          )}
          {showImage && post.images.length === 1 && (
            <Image
              image={post.images[0]}
              to={postURL}
              target={target}
              isMobile={isMobile}
              loading={imageLoadingStyle}
            />
          )}
          {showImage && post.images.length > 1 && (
            <PostImageGallery post={post} isMobile={isMobile} />
          )}
        </div>
        <div className="post-card-bottom post-card-bottom-main">
          <div className="left">
            <PostVotes post={post} />
            <Link
              to={postURL}
              className="button button-text button-with-icon post-card-button-with-icon"
              target={target}
            >
              <CommentIcon />
              <span className="post-card-text-content">
                {stringCount(post.noComments, false, 'bình luận', 'bình luận')}
              </span>
            </Link>
            <PostShareButton post={post} />
          </div>
        </div>
      </div>
    </div>
  );
};

PostCard.propTypes = {
  index: PropTypes.number,
  initialPost: PropTypes.object,
  hideVoting: PropTypes.bool,
  openInTab: PropTypes.bool,
  compact: PropTypes.bool,
  inModTools: PropTypes.bool,
  disableEmbeds: PropTypes.bool,
  onRemoveFromList: PropTypes.func,
};

export default PostCard;

export const MemorizedPostCard = React.memo(PostCard);
