// server.js
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();

// 1) public 폴더를 정적(static) 제공
app.use(express.static(path.join(__dirname, 'public')));

// 2) API를 위한 미들웨어
app.use(cors());
app.use(express.json());

// 이벤트 데이터 (예시)
const events = [
  {
    id: 'uni_or_job',
    title: '대학교에 진학할까요, 바로 취업할까요?',
    options: [
      { text: '진학한다', effect: { money: -500, happiness: +10, job: '학생' } },
      { text: '취업한다', effect: { money: +500, happiness: -5, job: '직장인' } }
    ]
  },
  {
    id: 'invest_or_save',
    title: '돈을 투자할까요, 저축할까요?',
    options: [
      { text: '투자한다', effect: { money: Math.random() < 0.5 ? +800 : -300, happiness: +5 } },
      { text: '저축한다', effect: { money: +100, happiness: -2 } }
    ]
  }
];

const sessions = {}; // 메모리 세션 저장

// (1) 게임 시작
app.post('/api/start', (req, res) => {
  const sid = uuidv4();
  sessions[sid] = { age: 18, money: 1000, happiness: 50, job: '무직', step: 0 };
  res.json({ sessionId: sid, state: sessions[sid] });
});

// (2) 다음 이벤트 조회
app.get('/api/event/:sid', (req, res) => {
  const s = sessions[req.params.sid];
  if (!s) return res.status(404).json({ error: '세션 없음' });

  if (s.age >= 22) {
    return res.json({
      ending: `인생이 종료되었습니다!\n최종 상태: 나이 ${s.age}, 돈 ${s.money}, 행복도 ${s.happiness}`
    });
  }

  const ev = events[s.step % events.length];
  res.json({ event: ev, state: s });
});

// (3) 선택 적용
app.post('/api/choose/:sid', (req, res) => {
  const s = sessions[req.params.sid];
  if (!s) return res.status(404).json({ error: '세션 없음' });

  const ev  = events[s.step % events.length];
  const opt = ev.options[req.body.optionIndex];
  Object.entries(opt.effect).forEach(([k, v]) => {
    if (typeof s[k] === 'number') s[k] += v;
    else s[k] = v;
  });
  s.age += 1;
  s.step += 1;

  res.json({ state: s });
});

// 서버 실행
const PORT = 3000;
app.listen(PORT, () => console.log(`서버 실행: http://localhost:${PORT}`));
