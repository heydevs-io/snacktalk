import React from 'react';
import PropTypes from 'prop-types';
import { kRound, mfetchjson } from '../../helper';
import { useDispatch, useSelector } from 'react-redux';
import { loginPromptToggled, snackAlertError } from '../../slices/mainSlice';
import { postAdded } from '../../slices/postsSlice';
import { useVoting } from '../../hooks';

const PostVotes = ({ className = '', post, sticky = false, disabled = false }) => {
  const loggedIn = useSelector((state) => state.main.user) !== null;
  const dispatch = useDispatch()

  const { upvotes, downvotes, vote, doVote } = useVoting(
    post.userVoted ? (post.userVotedUp ? true : false) : null,
    post.upvotes,
    post.downvotes
  );

  const handleVote = (up = true) => {
    if (!loggedIn) {
      dispatch(loginPromptToggled());
      return;
    }
    doVote(
      up,
      async () =>
        mfetchjson('/api/_postVote', {
          method: 'POST',
          body: JSON.stringify({ postId: post.id, up }),
        }),
      (rPost) => {
        dispatch(postAdded(rPost));
      },
      (error) => {
        dispatch(snackAlertError(error));
      }
    );
  };

  const points = upvotes - downvotes;
  const upCls = 'arrow-up' + (vote === true ? ' arrow-voted' : '');
  const downCls = vote === false ? 'arrow-voted ' : '';

  return (
    <div className={'post-votes' + (className === '' ? '' : ' ' + className)}>
      <div className="post-votes-content">
        <button
          className={'button-clear post-votes-arrow ' + upCls}
          onClick={() => handleVote()}
          disabled={disabled}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="24" height="24" rx="12" fill="#5CF9D5" />
            <path
              d="M13.1533 6.34001L14.3266 8.68668C14.4866 9.01334 14.9133 9.32668 15.2733 9.38668L17.3999 9.74001C18.7599 9.96668 19.0799 10.9533 18.0999 11.9267L16.4466 13.58C16.1666 13.86 16.0133 14.4 16.0999 14.7867L16.5733 16.8333C16.9466 18.4533 16.0866 19.08 14.6533 18.2333L12.6599 17.0533C12.2999 16.84 11.7066 16.84 11.3399 17.0533L9.34661 18.2333C7.91994 19.08 7.05327 18.4467 7.42661 16.8333L7.89994 14.7867C7.98661 14.4 7.83327 13.86 7.55327 13.58L5.89994 11.9267C4.92661 10.9533 5.23994 9.96668 6.59994 9.74001L8.72661 9.38668C9.07994 9.32668 9.50661 9.01334 9.66661 8.68668L10.8399 6.34001C11.4799 5.06668 12.5199 5.06668 13.1533 6.34001Z"
              fill="currentColor"
              stroke="#121212"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <p
          title={`Upvotes: ${post.upvotes.toLocaleString()} • Downvotes: ${post.downvotes.toLocaleString()}`}
        >
          {kRound(points)}
        </p>
        <button
          className={'button-clear post-votes-arrow arrow-down' + downCls}
          onClick={() => handleVote(false)}
          disabled={disabled}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="24" height="24" rx="12" fill="#F04611" />
            <path
              d="M13.1533 6.34001L14.3266 8.68668C14.4866 9.01334 14.9133 9.32668 15.2733 9.38668L17.3999 9.74001C18.7599 9.96668 19.0799 10.9533 18.0999 11.9267L16.4466 13.58C16.1666 13.86 16.0133 14.4 16.0999 14.7867L16.5733 16.8333C16.9466 18.4533 16.0866 19.08 14.6533 18.2333L12.6599 17.0533C12.2999 16.84 11.7066 16.84 11.3399 17.0533L9.34661 18.2333C7.91994 19.08 7.05327 18.4467 7.42661 16.8333L7.89994 14.7867C7.98661 14.4 7.83327 13.86 7.55327 13.58L5.89994 11.9267C4.92661 10.9533 5.23994 9.96668 6.59994 9.74001L8.72661 9.38668C9.07994 9.32668 9.50661 9.01334 9.66661 8.68668L10.8399 6.34001C11.4799 5.06668 12.5199 5.06668 13.1533 6.34001Z"
              stroke="#121212"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

PostVotes.propTypes = {
  className: PropTypes.string,
  post: PropTypes.object,
  onVote: PropTypes.func,
  sticky: PropTypes.bool,
  disabled: PropTypes.bool,
  mobile: PropTypes.bool,
};

export default PostVotes;
