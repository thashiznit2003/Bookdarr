import React from 'react';
import styles from './LoadingMessage.css';

const messages = [
  'Downloading more RAM',
  'Now in Technicolor',
  'Previously on Bookdarr...',
  'Bleep Bloop.',
  'Locating the required gigapixels to render...',
  'Spinning up the hamster wheel...',
  'At least you\'re not on hold',
  'Hum something loud while others stare',
  'Loading humorous message... Please Wait',
  'I could\'ve been faster in Python',
  'Don\'t forget to return your library books',
  'Congratulations! You are the 1000th visitor.',
  'HELP! I\'m being held hostage and forced to write these stupid lines!',
  'RE-calibrating the internet...',
  'I\'ll be here all week',
  'Don\'t forget to tip your waitress',
  'Apply directly to the forehead',
  'Loading Battlestation',
  'Maybe you should read a book',
  'Go touch grass, then come back',
  'This one actually kinda works!',
  'Butterfly in the sky',
  'I can go twice as high',
  'Take a look, it\'s in a book',
  'I can go anywhere',
  'Friends to know, and ways to grow',
  'I can be anything',
  'Thanks ChatGPT!'
];

let message = null;

function LoadingMessage() {
  if (!message) {
    const index = Math.floor(Math.random() * messages.length);
    message = messages[index];
  }

  return (
    <div className={styles.loadingMessage}>
      {message}
    </div>
  );
}

export default LoadingMessage;
