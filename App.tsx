import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  PanResponder,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const GAME_WIDTH = SCREEN_WIDTH - 20;
const GAME_HEIGHT = SCREEN_HEIGHT - 180;

const PADDLE_WIDTH = 110;
const PADDLE_HEIGHT = 16;
const PADDLE_Y = GAME_HEIGHT - 40;

const BALL_SIZE = 18;
const INITIAL_BALL_SPEED_X = 4;
const INITIAL_BALL_SPEED_Y = -5;

export default function App() {
  const [paddleX, setPaddleX] = useState((GAME_WIDTH - PADDLE_WIDTH) / 2);
  const [ballX, setBallX] = useState(GAME_WIDTH / 2 - BALL_SIZE / 2);
  const [ballY, setBallY] = useState(GAME_HEIGHT / 2);
  const [ballSpeedX, setBallSpeedX] = useState(INITIAL_BALL_SPEED_X);
  const [ballSpeedY, setBallSpeedY] = useState(INITIAL_BALL_SPEED_Y);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const scoreRef = useRef(0);

  const resetGame = () => {
    setPaddleX((GAME_WIDTH - PADDLE_WIDTH) / 2);
    setBallX(GAME_WIDTH / 2 - BALL_SIZE / 2);
    setBallY(GAME_HEIGHT / 2);
    setBallSpeedX(INITIAL_BALL_SPEED_X);
    setBallSpeedY(INITIAL_BALL_SPEED_Y);
    setScore(0);
    scoreRef.current = 0;
    setStarted(false);
    setGameOver(false);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        if (!started && !gameOver) {
          setStarted(true);
        }
      },
      onPanResponderMove: (_, gestureState) => {
        const nextX = gestureState.moveX - PADDLE_WIDTH / 2 - 10;
        const clampedX = Math.max(0, Math.min(nextX, GAME_WIDTH - PADDLE_WIDTH));
        setPaddleX(clampedX);
      },
    })
  ).current;

  useEffect(() => {
    if (!started || gameOver) return;

    const timer = setInterval(() => {
      setBallX((prevX) => {
        let nextX = prevX + ballSpeedX;

        if (nextX <= 0 || nextX + BALL_SIZE >= GAME_WIDTH) {
          setBallSpeedX((prev) => -prev);
          nextX = Math.max(0, Math.min(nextX, GAME_WIDTH - BALL_SIZE));
        }

        return nextX;
      });

      setBallY((prevY) => {
        let nextY = prevY + ballSpeedY;

        if (nextY <= 0) {
          setBallSpeedY((prev) => -prev);
          return 0;
        }

        const hitPaddle =
          nextY + BALL_SIZE >= PADDLE_Y &&
          nextY + BALL_SIZE <= PADDLE_Y + PADDLE_HEIGHT + 10 &&
          ballX + BALL_SIZE >= paddleX &&
          ballX <= paddleX + PADDLE_WIDTH;

        if (hitPaddle) {
          setBallSpeedY((prev) => -Math.abs(prev) - 0.2);

          const paddleCenter = paddleX + PADDLE_WIDTH / 2;
          const ballCenter = ballX + BALL_SIZE / 2;
          const distanceFromCenter = ballCenter - paddleCenter;

          setBallSpeedX(distanceFromCenter * 0.08);

          scoreRef.current += 1;
          setScore(scoreRef.current);

          return PADDLE_Y - BALL_SIZE;
        }

        if (nextY > GAME_HEIGHT) {
          setGameOver(true);
          setStarted(false);
          return prevY;
        }

        return nextY;
      });
    }, 16);

    return () => clearInterval(timer);
  }, [started, gameOver, ballSpeedX, ballSpeedY, paddleX, ballX]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Pong</Text>
      <Text style={styles.score}>Pontuação: {score}</Text>

      <View style={styles.gameArea} {...panResponder.panHandlers}>
        <View
          style={[
            styles.ball,
            {
              left: ballX,
              top: ballY,
            },
          ]}
        />

        <View
          style={[
            styles.paddle,
            {
              left: paddleX,
              top: PADDLE_Y,
            },
          ]}
        />

        {!started && !gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.overlayTitle}>Pong</Text>
            <Text style={styles.overlayText}>Toque e arraste para mover</Text>
            <Text style={styles.overlayText}>Segure na área do jogo para começar</Text>
          </View>
        )}

        {gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.gameOver}>Game Over</Text>
            <Text style={styles.overlayText}>Pontuação final: {score}</Text>
            <Text style={styles.restart} onPress={resetGame}>
              Reiniciar
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.hint}>Arraste o dedo horizontalmente para defender a bola</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
    alignItems: 'center',
    paddingTop: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff',
  },
  score: {
    marginTop: 8,
    marginBottom: 14,
    fontSize: 21,
    fontWeight: '700',
    color: '#58a6ff',
  },
  gameArea: {
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#161b22',
    borderWidth: 2,
    borderColor: '#30363d',
    position: 'relative',
    overflow: 'hidden',
  },
  ball: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: '#ffd166',
  },
  paddle: {
    position: 'absolute',
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    borderRadius: 10,
    backgroundColor: '#3fb950',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  overlayTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 14,
  },
  overlayText: {
    marginTop: 8,
    fontSize: 18,
    color: '#e6edf3',
    textAlign: 'center',
  },
  gameOver: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ff6b6b',
    marginBottom: 12,
  },
  restart: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '800',
    color: '#ffd166',
  },
  hint: {
    marginTop: 16,
    fontSize: 15,
    color: '#8b949e',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});