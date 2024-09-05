import React from 'react';
import PropTypes from 'prop-types';
import { kRound, mfetchjson } from '../../helper';
import { useDispatch, useSelector } from 'react-redux';
import { loginPromptToggled, snackAlertError } from '../../slices/mainSlice';
import { postAdded } from '../../slices/postsSlice';
import { useVoting } from '../../hooks';
import UpvoteStarIcon from '../svg/icons/upvote-star';
import DownvoteStartIcon from '../svg/icons/downvote-star';

const PostVotes = ({ className = '', post, disabled = false }) => {
  const loggedIn = useSelector((state) => state.main.user) !== null;
  const dispatch = useDispatch();

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
          <UpvoteStarIcon />
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
          <DownvoteStartIcon />
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
