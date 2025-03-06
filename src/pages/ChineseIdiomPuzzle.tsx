import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Dialog, DialogContent, DialogActions } from '@mui/material';
import { PageContainer } from '../components/common';
import IDIOM_MAP from './idiom_map.json';

const GameWrapper = styled.div`
  width: 100%;
  margin-top: 80px;
  padding-top: 1vw;
  text-align: center;
  background: #FCE6C5;
`;

const TitleText = styled.div`
  color: #664022;
  margin-bottom: 6vw;
  font-size: 20px;
  font-weight: bold;
  position: fixed;
  width: 100%;
  top: 0;
  padding: 40px 0 20px 0;
  z-index: 1000;
  background-color: #FCE6C5;
`;

const GameField = styled.div`
  background-color: #FFFBF5;
  margin: 1.5vw;
  padding: 1.5vw;
  border-radius: 4px;
  text-align: center;
`;

const GateText = styled.div`
  margin: 1vw 0;
  font-size: 25px;
  font-weight: bold;
  color: #2A2A2A;
`;

const BoxContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 8px;
  margin: 2vw auto;
  max-width: 90vw;
  padding: 0 1vw;
`;

const BoxItem = styled.div<{ itemType: number; $isSelected: boolean }>`
  aspect-ratio: 1;
  width: 100%;
  border-radius: 4px;
  text-align: center;
  display: flex;
  font-size: clamp(16px, 4vw, 32px);
  font-weight: bold;
  box-shadow: 0 3px 3px 0 rgba(0, 0, 0, 0.3);
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: ${props => props.$isSelected ? '2px solid #FB220A' : '1px solid #333333'};
  transition: all 0.3s ease;
  background-color: ${props => {
    switch (props.itemType) {
      case 0: return '#f8f8f8';  // 固定文字
      case 1: return '#ffffff';  // 待填写
      case 2: return '#ffffff';  // 空白格子
      case 3: return '#fff3d6';  // 已填写
      case 4: return '#e6ffe6';  // 已完成
      default: return '#ffffff';
    }
  }};
  opacity: ${props => props.itemType === 2 ? 0.05 : 1};
  color: ${props => {
    switch (props.itemType) {
      case 0: return '#333333';  // 固定文字
      case 3: return '#333333';  // 已填写
      case 4: return '#006400';  // 已完成
      default: return '#333333';
    }
  }};
  cursor: ${props => {
    switch (props.itemType) {
      case 1: return 'pointer';  // 待填写
      case 3: return 'pointer';  // 已填写
      case 4: return 'default';  // 已完成
      case 0: return 'default';  // 固定文字
      default: return 'default';
    }
  }};

  &:hover {
    background-color: ${props => {
      if (props.itemType === 1) return '#fff3f3';
      if (props.itemType === 3) return '#fff0cc';
      return props.itemType === 4 ? '#e6ffe6' : '#f8f8f8';
    }};
  }

  @keyframes blink-green {
    0% {
      background-color: #e6ffe6;
    }
    50% {
      transform: scale(1.05);
      background-color: #ccffcc;
    }
    100% {
      background-color: #e6ffe6;
    }
  }

  ${props => props.itemType === 4 && `
    animation: blink-green 0.5s ease;
    box-shadow: 0 2px 4px rgba(0, 100, 0, 0.2);
  `}

  @keyframes shake-red {
    0%, 20%, 40%, 60%, 80%, 100% {
      transform: translateX(-2px)
    }
    10%, 30%, 50%, 70%, 90% {
      transform: translateX(2px)
    }
  }
`;

const ButtonLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 4vw 3vw;
  font-size: 13px;
  color: #A84F29;

  .line-right {
    display: flex;
    .promot-it {
      padding: 0 8px;
    }
  }
`;

const OptionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 4vw 3vw;
  flex-wrap: wrap;
`;

const OptionItem = styled.div<{ $isUsed: boolean }>`
  width: 10vw;
  height: 10vw;
  border-radius: 4px;
  display: flex;
  font-size: 7vw;
  font-weight: bold;
  border: 1px solid ${props => props.$isUsed ? '#cccccc' : '#333333'};
  box-shadow: ${props => props.$isUsed ? 'none' : '0 3px 3px 0 rgba(0, 0, 0, 0.3)'};
  justify-content: center;
  align-items: center;
  cursor: ${props => props.$isUsed ? 'default' : 'pointer'};
  opacity: ${props => props.$isUsed ? 0.5 : 1};
  background-color: ${props => props.$isUsed ? '#f5f5f5' : 'white'};
  color: ${props => props.$isUsed ? '#999999' : 'inherit'};
  
  &:active {
    background-color: ${props => props.$isUsed ? '#f5f5f5' : '#fce9c9'};
  }
`;

const Button = styled.button`
  background: linear-gradient(#FE901B 0%, #FDB33D 100%);
  border-radius: 16px;
  width: 60%;
  border: none;
  padding: 10px 20px;
  color: white;
  cursor: pointer;
  margin: 9vw 0 6vw;
`;

interface IdiomItem {
  txt: string;
  type: number;
  ans?: {
    i: number;
    c: string;
    used: boolean;
  };
}

interface AnswerItem {
  i: number;
  c: string;
  used: boolean;
  pos: string;
}

interface GameState {
  idiomMap: IdiomItem[];
  answerMap: AnswerItem[];
}

const ChineseIdiomPuzzle: React.FC = () => {
  const [curLevel, setCurLevel] = useState(1);
  const [cursorIndex, setCursorIndex] = useState(-1);
  const [gameState, setGameState] = useState<GameState>({
    idiomMap: [],
    answerMap: []
  });
  const [playedLevelIdx, setPlayedLevelIdx] = useState<number[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const num2ChStr = (num: number): string => {
    const chnNumChar = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const chnUnitChar = ['', '十', '百', '千', '万', '十', '百', '千', '亿', '十', '百', '千'];
    let chnStr = '';
    let str = num.toString();
    
    while (str.length > 0) {
      const tmpNum = chnNumChar[parseInt(str.substr(0, 1))];
      const tmpChar = chnUnitChar[str.length - 1];
      chnStr += (chnStr.substr(-1, 1) === '零' && tmpNum === '零') ? '' : tmpNum;
      if (tmpNum !== '零') {
        chnStr += tmpChar;
      }
      if (chnStr === '一十') {
        chnStr = '十';
      }
      str = str.substr(1);
      if (parseInt(str) === 0) {
        if (str.length >= 8 && chnStr.substr(-1, 1) !== '亿') {
          chnStr += '亿';
        } else if (str.length >= 5 && chnStr.substr(-1, 1) !== '万') {
          chnStr += '万';
        }
        str = '';
      }
    }
    return chnStr;
  };

  const calcMapIndex = (): number => {
    const range = IDIOM_MAP.length;
    let retry = Math.floor(range / 2);
    let idx = Math.floor(Math.random() * range);
    
    while (playedLevelIdx.includes(idx) && retry > 0) {
      idx = Math.floor(Math.random() * range);
      retry--;
    }
    setPlayedLevelIdx([...playedLevelIdx, idx]);
    return idx;
  };

  const findWordStart = (pos: number) => {
    let xx = pos;
    let yy = pos;
    
    const isMapFilled = (idx: number) => {
      if (idx < 0 || idx >= gameState.idiomMap.length) return false;
      const t = gameState.idiomMap[idx].type;
      return t === 0 || t === 3 || t === 4;
    };

    // 横向查找
    while (xx >= 0 && xx < gameState.idiomMap.length) {
      if (isMapFilled(xx)) {
        if (xx % 9 === 0) {
          break;
        } else if (isMapFilled(xx - 1)) {
          xx--;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    // 纵向查找
    while (yy >= 0 && yy < gameState.idiomMap.length) {
      if (isMapFilled(yy)) {
        if (yy - 9 < 0) {
          break;
        } else if (isMapFilled(yy - 9)) {
          yy -= 9;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return { x: xx, y: yy };
  };

  const checkLineFinish = (pos: number) => {
    console.log('Checking line completion for position:', pos);
    const { idiomMap } = gameState;
    const sp = findWordStart(pos);
    console.log('Word start positions:', sp);
    
    let xx: number[] = [];
    let yy: number[] = [];

    for (let i = 0; i < 4; i++) {
      const idx = sp.x + i;
      if (idx >= idiomMap.length) break;
      
      const it = idiomMap[idx];
      if (it.type === 0 || it.type === 4 || (it.type === 3 && it.ans)) {
        xx.push(idx);
      }
    }

    for (let i = 0; i < 4; i++) {
      const idx = sp.y + i * 9;
      if (idx >= idiomMap.length) break;
      
      const it = idiomMap[idx];
      if (it.type === 0 || it.type === 4 || (it.type === 3 && it.ans)) {
        yy.push(idx);
      }
    }

    console.log('Completed cells:', { horizontal: xx, vertical: yy });

    if (xx.length === 4) {
      console.log('Horizontal line completed');
      xx.forEach(index => {
        const item = idiomMap[index];
        idiomMap[index] = {
          ...item,
          type: 4,
          txt: item.ans?.c || item.txt,
          ans: item.ans
        };
      });
    }
    if (yy.length === 4) {
      console.log('Vertical line completed');
      yy.forEach(index => {
        const item = idiomMap[index];
        idiomMap[index] = {
          ...item,
          type: 4,
          txt: item.ans?.c || item.txt,
          ans: item.ans
        };
      });
    }
    console.log('Updated idiom map:', idiomMap);
    setGameState({
      ...gameState,
      idiomMap
    });
  };

  const reloadMap = () => {
    try {
      setCursorIndex(-1);
      const idx = calcMapIndex();
      const data = IDIOM_MAP[idx];
      
      if (!data) {
        console.error('No data found for index:', idx);
        return;
      }

      const newIdiomMap = data.s.split('').map(m => ({
        txt: m === '&' ? '' : m,
        type: m === '&' ? 1 : m === '@' ? 2 : 0
      }));
      
      const newAnswerMap = data.a.map((m: any, ii: number) => ({
        ...m,
        used: false,
        pos: ii.toString()
      }));
      console.log('New answer map:', newAnswerMap);
      console.log('New idiom map:', newIdiomMap);
      setGameState({
        idiomMap: newIdiomMap,
        answerMap: newAnswerMap
      });
    } catch (error) {
      console.error('Error loading map:', error);
      setDialogMessage('加载关卡失败，请重试');
      setDialogOpen(true);
    }
  };

  const handleCellClick = (item: IdiomItem, index: number) => {
    console.log('Cell clicked:', { index, item, cursorIndex });
    
    // 如果是已完成的格子（type === 4）或空白格子（type === 2）或固定文字（type === 0），不响应点击
    if (item.type === 4 || item.type === 2 || item.type === 0) {
      console.log('Cell click ignored - invalid type:', item.type);
      return;
    }
    
    // 如果点击已选中的格子，取消选中
    if (index === cursorIndex) {
      console.log('Deselecting cell:', index);
      setCursorIndex(-1);
      return;
    }
    
    // 选中新格子
    console.log('Selecting new cell:', index);
    setCursorIndex(index);
  };

  const handleAnswerClick = (item: AnswerItem) => {
    console.log('Answer clicked:', { item, cursorIndex });
    
    // 如果没有选中格子或答案已使用，不响应点击
    if (cursorIndex < 0 || item.used) {
      console.log('Answer click ignored:', cursorIndex < 0 ? 'no cell selected' : 'answer already used');
      return;
    }

    try {
      const { idiomMap, answerMap } = gameState;
      const currentCell = idiomMap[cursorIndex];
      currentCell.txt = item.c;
      console.log('Current cell state before update:', { currentCell, cursorIndex });

      // 如果当前格子已经有答案，先恢复之前的答案状态
      if (currentCell.ans) {
        const oldAnswerIndex = answerMap.findIndex(a => a.i === currentCell.ans?.i);
        console.log('Restoring previous answer:', { oldAnswerIndex, previousAnswer: currentCell.ans });
        if (oldAnswerIndex !== -1) {
          // 完全恢复原答案的状态
          answerMap[oldAnswerIndex].used = false;
        }
      }

      // 更新答案状态
      const answerIndex = answerMap.findIndex(a => a.i === item.i);
      console.log('Updating answer state:', { answerIndex, newAnswer: item });
      if (answerIndex !== -1) {
        answerMap[answerIndex].used = true;
      }

      // 更新当前格子
      idiomMap[cursorIndex] = {
        ...currentCell,
        txt: item.c,
        type: 3,
        ans: {
          i: item.i,
          c: item.c,
          used: true
        }
      };
      console.log('Updated cell state:', idiomMap[cursorIndex]);

      // 更新状态
      setGameState({
        idiomMap,
        answerMap
      });

      setCursorIndex(-1);

      // 检查是否完成
      checkLineFinish(cursorIndex);
      checkLevelFinish();
    } catch (error) {
      console.error('Error handling answer click:', error);
    }
  };

  const checkLevelFinish = () => {
    const { idiomMap } = gameState;
    const isComplete = !idiomMap.some(item => item.type === 1 || item.type === 3);
    console.log('Checking level completion:', { isComplete });
    if (isComplete) {
      setDialogMessage('恭喜过关，继续下一关！');
      setDialogOpen(true);
    }
  };

  const handleNextLevel = () => {
    setDialogOpen(false);
    if (dialogMessage === '确定要跳过本关？') {
      setCurLevel(prev => prev + 1);
      reloadMap();
    } else if (dialogMessage === '恭喜过关，继续下一关！') {
      setCurLevel(prev => prev + 1);
      reloadMap();
    }
  };

  const handleSkipLevel = () => {
    setDialogMessage('确定要跳过本关？');
    setDialogOpen(true);
  };

  const showTipDialog = () => {
    setDialogMessage('查看答案？');
    setDialogOpen(true);
  };

  const handleTipConfirm = () => {
    setDialogOpen(false);
    if (dialogMessage === '查看答案？') {
      // 找到当前空格对应的答案
      const currentAnswer = gameState.answerMap.find(item => !item.used && item.i === cursorIndex);
      if (currentAnswer) {
        handleAnswerClick(currentAnswer);
      }
    }
  };

  useEffect(() => {
    try {
      reloadMap();
    } catch (error) {
      console.error('Error in initial load:', error);
    }
  }, []);

  return (
    <PageContainer>
      <GameWrapper>
        <TitleText>一起猜成语</TitleText>
        <GameField>
          <GateText>第{num2ChStr(curLevel)}关</GateText>
          <BoxContainer>
            {gameState.idiomMap.map((item, index) => (
              <BoxItem
                key={index}
                itemType={item.type}
                $isSelected={index === cursorIndex}
                onClick={() => handleCellClick(item, index)}
              >
                {item.txt || ''}
              </BoxItem>
            ))}
          </BoxContainer>
          <ButtonLine>
            <div />
            <div className="line-right">
              <div className="promot-it" onClick={showTipDialog}>
                <span style={{ fontSize: '27px' }}>ℹ️</span>
                <div>提示</div>
              </div>
            </div>
          </ButtonLine>
          <OptionsContainer>
            {gameState.answerMap.map((item, index) => (
              <OptionItem
                key={index}
                $isUsed={item.used}
                onClick={() => handleAnswerClick(item)}
              >
                {item.c}
              </OptionItem>
            ))}
          </OptionsContainer>
          <Button onClick={handleSkipLevel}>跳过本关</Button>
        </GameField>
        
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          PaperProps={{
            style: {
              borderRadius: '12px',
              padding: '10px'
            }
          }}
        >
          <DialogContent>
            <p style={{ margin: '10px 0', textAlign: 'center' }}>{dialogMessage}</p>
          </DialogContent>
          <DialogActions style={{ justifyContent: 'center', padding: '10px' }}>
            <Button 
              onClick={dialogMessage === '查看答案？' ? handleTipConfirm : handleNextLevel}
              style={{ margin: 0 }}
            >
              确定
            </Button>
          </DialogActions>
        </Dialog>
      </GameWrapper>
    </PageContainer>
  );
};

export default ChineseIdiomPuzzle; 