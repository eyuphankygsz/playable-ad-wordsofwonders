import gsap, { Power0 } from "gsap";
import {Container, Sprite, Text, TextStyle, Rectangle, Graphics,} from "pixi.js";
import { GAME_HEIGHT, GAME_WIDTH, app } from ".";

export default class Game extends Container {
  constructor() {
    super();
    this.loadFont().then(() => {
      this.init();
    });

    this.interacting = false;
    this.guessedWord = "";
    this.line = null;
    this.words = [
      {
        word: "GOLD",
        xPositions: [0, 1, 2, 3],
        yPositions: [0, 0, 0, 0],
        holders: [],
        found: false,
      },
      {
        word: "GOD",
        xPositions: [0, 0, 0],
        yPositions: [0, 1, 2],
        holders: [],
        found: false,
      },
      {
        word: "LOG",
        xPositions: [2, 2, 2],
        yPositions: [0, 1, 2],
        holders: [],
        found: false,
      },
      {
        word: "DOG",
        xPositions: [0, 1, 2],
        yPositions: [2, 2, 2],
        holders: [],
        found: false,
      },
    ];

    this.playButtonFont = new TextStyle({
      fontFamily: "Sniglet",
      fontSize: 24,
      fill: "white",
      resolution: 4,
    });

  }

  loadFont() {
    const font = new FontFace("Sniglet", "url(/assets/Sniglet-Regular.ttf)");
    return font.load().then((loadedFont) => {
      document.fonts.add(loadedFont);
    });
  }

  init() {
    this.interacting = false;
    this.guessedWord = "";

    this.interactive = true;

    let bg = Sprite.from("background");
    bg.anchor.set(0.5);
    bg.x = GAME_WIDTH * 0.5;
    bg.y = GAME_HEIGHT * 0.5;
    bg.scale.set(GAME_WIDTH / bg.width);
    this.addChild(bg);


    const lettersFontOrange = new TextStyle({
      fontFamily: "Sniglet",
      fontSize: 60,
      fontWeight: 600,
      fill: "#FF9933",
      resolution: 4,
    });
    const lettersFontWhite = new TextStyle({
      fontFamily: "Sniglet",
      fontSize: 60,
      fontWeight: 600,
      fill: "#FFFFFF",
      resolution: 4,
    });

    const displayLettersFont = new TextStyle({
      fontFamily: "Sniglet",
      fontSize: 42,
      fontWeight: 600,
      fill: "#FFFFFF",
      resolution: 4,
    });

    const letters = [
      {
        letter: "L",
        pos: [0, -1],
      },
      {
        letter: "G",
        pos: [1, 0],
      },
      {
        letter: "O",
        pos: [0, 1],
      },
      {
        letter: "D",
        pos: [-1, 0],
      },
    ];
    const guessWords = new Container();

    const wordHolders = [];
    for (let i = 0; i < this.words.length; i++) {
      const word = this.words[i];
      const wordContainer = new Container();
      for (let j = 0; j < word.word.length; j++) {
        const l = word.word.charAt(j);
        let box = false;

        for (let k = i - 1; k >= 0; k--) {
          const element = this.words[k];
          for (let l = 0; l < element.holders.length; l++) {
            const element2 = element.holders[l].pos.getGlobalPosition();
            if (
              element2.x == word.xPositions[j] * 85 &&
              element2.y == word.yPositions[j] * 85
            ) {
              box = element.holders[l].pos;
              break;
            }
          }
        }
        if (!box) {
          box = Sprite.from("empty-box");
          box.anchor.set(0.5);
          box.scale.set(0.3);
          box.x = word.xPositions[j] * 85;
          box.y = word.yPositions[j] * 85;
        }
        wordContainer.addChild(box);

        word.holders.push({
          pos: box,
          letter: l,
        });
      }
      wordHolders.push(wordContainer);
      guessWords.addChild(wordContainer);
    }

    guessWords.x = 40 + GAME_WIDTH * 0.5 - guessWords.width / 2;
    guessWords.y = 100;
    this.addChild(guessWords);

    //--------Display Letters--------
    const letterDisplayContainer = new Container();
    const letterDisplayBackground = Sprite.from("empty-box");
    letterDisplayBackground.anchor.set(0.5);
    letterDisplayBackground.scale.set(0, 0.24);
    letterDisplayBackground.tint = 0xff9933;
    letterDisplayContainer.addChild(letterDisplayBackground);
    letterDisplayContainer.x = GAME_WIDTH * 0.5;
    letterDisplayContainer.y = GAME_HEIGHT * 0.5 + 20;
    letterDisplayContainer.visible = false;
    this.addChild(letterDisplayContainer);

    const displayedLetters = [];
    const letterSpacing = 30;
    let shaking = false;

    function displayLetters(letter, selectedHolder) {
      if (letter) {
        letterDisplayContainer.visible = true;
        letterDisplayBackground.scale.x += 0.14;
        const textElement = new Text(letter, displayLettersFont);
        textElement.anchor.set(0.5);
        textElement.y = 0;
        displayedLetters.push(textElement);

        const totalWidth = (displayedLetters.length - 1) * letterSpacing;
        const startX = letterDisplayBackground.x - totalWidth / 2;

        for (let i = 0; i < displayedLetters.length; i++) {
          const element = displayedLetters[i];
          element.x = startX + i * letterSpacing;
        }
        letterDisplayContainer.addChild(textElement);
      } else {
        if (selectedHolder === undefined || (selectedHolder && selectedHolder.found)) 
          {
          let updateCount = 0;
          shaking = true;
          gsap.to(letterDisplayContainer, {
            duration: 1,
            alpha: 1,
            ease: "power1.out",
            delay: 0.1,
            onUpdate: () => {
              if (updateCount % 10 === 0) {
                const randomShakeX = (Math.random() - 0.5) * 2;
                const randomShakeY = (Math.random() - 0.5) * 2;
                letterDisplayContainer.x += randomShakeX;
                letterDisplayContainer.y += randomShakeY;
              }
              updateCount++;
            },
            onComplete: () => {
              shaking = false;
              letterDisplayBackground.scale.x = 0;
              letterDisplayContainer.visible = false;
              for (let i = displayedLetters.length; i > 0; i--) {
                letterDisplayContainer.removeChildAt(i);
                displayedLetters.pop();
              }
              for (let i = createdLines.length - 1; i >= 0; i--) {
                const element = createdLines[i];
                if (element.line) element.line.clear();
                createdLines.pop();
              }
            },
          });
        }
        else if(!shaking){
          letterDisplayBackground.scale.x = 0;
          letterDisplayContainer.visible = false;
          for (let i = displayedLetters.length; i > 0; i--) {
            letterDisplayContainer.removeChildAt(i);
            displayedLetters.pop();
          }
          for (let i = createdLines.length - 1; i >= 0; i--) {
            const element = createdLines[i];
            if (element.line) element.line.clear();
            createdLines.pop();
          }
        }
      }
    }
    function isAlreadySelected(letter) {
      return displayedLetters.some((x) => x.text === letter);
    }
    //------------------------

    const fakeBackgroundCircle = Sprite.from("empty-circle");
    fakeBackgroundCircle.anchor.set(0.5);
    fakeBackgroundCircle.scale.set(0.04);
    fakeBackgroundCircle.alpha = 0.7;
    fakeBackgroundCircle.x = GAME_WIDTH * 0.5;
    fakeBackgroundCircle.y = GAME_HEIGHT / 2 + 180;
    this.addChild(fakeBackgroundCircle);

    this.line = new Graphics();
    this.addChild(this.line);
    this.addEventListener("pointermove", (evt) => {
      if (this.interacting) {
        if (createdLines.length >= 4) {
          this.line.clear();
          return;
        }
        const globalPosition = evt.global; // Global pozisyonu al
        const endX = globalPosition.x;
        const endY = globalPosition.y;

        const startX = createdLines[createdLines.length - 1].startXPos;
        const startY = createdLines[createdLines.length - 1].startYPos;

        this.line.clear();
        this.line.lineStyle(10, 0xff9933, 1);
        this.line.moveTo(startX, startY);
        this.line.lineTo(endX, endY);
      }
    });
    this.addEventListener("pointerup", () => {
      this.line.clear();
      const selectedHolder = this.checkWord(
        letterContainer,
        lettersFontOrange,
        letterContainer
      );
      displayLetters(false, selectedHolder);
    });

    const letterContainer = new Container();
    const backgroundCircle = Sprite.from("empty-circle");
    backgroundCircle.anchor.set(0.5);
    backgroundCircle.scale.set(0.04);
    backgroundCircle.alpha = 0;

    letterContainer.addChild(backgroundCircle);
    letterContainer.x = GAME_WIDTH * 0.5;
    letterContainer.y = GAME_HEIGHT / 2 + 180;

    let createdLines = [];

    for (let i = 0; i < letters.length; i++) {
      const theLetter = letters[i];

      const letterPosition = new Container();

      const letterHolder = Sprite.from("empty-circle");
      letterPosition.addChild(letterHolder);
      letterHolder.anchor.set(0.5);
      letterHolder.scale.set(0.012);
      letterHolder.alpha = 0;
      letterHolder.tint = 0xff9933;

      letterHolder.x = theLetter.pos[0] * 70;
      letterHolder.y = theLetter.pos[1] * 70;

      letterHolder.interactive = true;
      const letterText = new Text(theLetter.letter, lettersFontOrange);
      letterText.hitArea = new Rectangle(0, 0, 0, 0);

      letterText.anchor.set(0.5);
      letterText.x = theLetter.pos[0] * 70;
      letterText.y = theLetter.pos[1] * 70;
      letterPosition.addChild(letterText);
      letterText.interactive = false;

      letterHolder.on("pointerdown", () => {
        const tempLetterHolder = letterPosition.getChildAt(1);
        if (isAlreadySelected(tempLetterHolder.text)) return;

        createdLines.push({
          startXPos: letterHolder.getGlobalPosition().x,
          startYPos: letterHolder.getGlobalPosition().y,
        });
        this.changeColor(letterHolder, tempLetterHolder, 1, lettersFontWhite);
        this.addLetter(tempLetterHolder.text);
        displayLetters(tempLetterHolder.text, null);
      });
      letterHolder.on("pointerover", () => {
        if (this.interacting) {
          const tempLetterHolder = letterPosition.getChildAt(1);
          if (isAlreadySelected(tempLetterHolder.text)) return;

          const lastElement = createdLines[createdLines.length - 1];
          lastElement.endXPos = letterHolder.getGlobalPosition().x;
          lastElement.endYPos = letterHolder.getGlobalPosition().y;

          lastElement.line = new Graphics();
          lastElement.line.lineStyle(10, 0xff9933, 1);
          lastElement.line.moveTo(lastElement.startXPos, lastElement.startYPos);
          lastElement.line.lineTo(lastElement.endXPos, lastElement.endYPos);

          this.addChildAt(
            createdLines[createdLines.length - 1].line,
            this.getChildIndex(this.line) + 1
          );

          createdLines.push({
            startXPos: letterHolder.getGlobalPosition().x,
            startYPos: letterHolder.getGlobalPosition().y,
          });
          this.changeColor(letterHolder, tempLetterHolder, 1, lettersFontWhite);
          this.addLetter(tempLetterHolder.text);
          displayLetters(tempLetterHolder.text, null);
        }
      });

      letterHolder.on("pointerup", () => {
        const selectedHolder = this.checkWord(
          letterContainer,
          lettersFontOrange,
          letterContainer
        );
        displayLetters(false, selectedHolder);
      });
      letterHolder.on("pointerupoutside", () => {
        const selectedHolder = this.checkWord(
          letterContainer,
          lettersFontOrange,
          letterContainer
        );
        displayLetters(false, selectedHolder);
      });
      letterContainer.addChild(letterPosition);
    }
    this.addChild(letterContainer);

    const shuffleButton = Sprite.from("shuffle-button");
    let shuffleProcess = false;
    shuffleButton.anchor.set(.5);
    shuffleButton.scale.set(.1);
    shuffleButton.x = letterContainer.x;
    shuffleButton.y = letterContainer.y;
    shuffleButton.interactive = true;
    shuffleButton.on("pointerdown", () => {
      if(shuffleProcess) return;
      shuffleProcess = true;
      const textElements = [];

      for (let i = 1; i < letterContainer.children.length; i++) {
          const element = letterContainer.children[i];
          const textElement = element.children[1];
          textElements.push(textElement);
      }
  
      for (let i = textElements.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [textElements[i], textElements[j]] = [textElements[j], textElements[i]];
      }
  

      for (let i = 1; i < letterContainer.children.length; i++) {
          const element = letterContainer.children[i];
          if(element.children[1])
            element.removeChildAt(1);

          const textElement = textElements[i - 1]; 
          element.addChild(textElement);
          
          gsap.to(textElement, {
            duration: .2,
            alpha: 1,
            x: element.children[0].x,
            y: element.children[0].y,
            ease: "power1.out",
            delay: 0.1
          });
      }
      shuffleProcess = false;
      if(true)
        console.log("deneme");
  });
    this.addChild(shuffleButton);

    const playButton = Sprite.from("install-button");
    const playText = new Text("PLAY NOW!", this.playButtonFont);
    playText.anchor.set(0.5);
    playButton.addChild(playText);

    playButton.anchor.set(0.5);
    playButton.scale.set(1.4);
    playButton.x = GAME_WIDTH * 0.5;
    playButton.y = GAME_HEIGHT - 50;
    playButton.interactive = true;
    playButton.on("pointerdown", function () {
      window.open("#");
    });
    this.shrinkAnimation(playButton);
    this.addChild(playButton);
  }

  shrinkAnimation(button) {
    gsap.to(button.scale, {
      duration: 0.45,
      x: 1.5,
      y: 1.5,
      ease: "none",
      onComplete: () => {
        gsap.to(button.scale, {
          duration: 0.45,
          x: 1.4,
          y: 1.4,
          ease: "none",
          onComplete: () => {
            this.shrinkAnimation(button);
          },
        });
      },
    });
  }
  changeColor(letterHolder, text, alpha, font) {
    letterHolder.alpha = alpha;
    text.style = font;
  }
  addLetter(letter) {
    this.guessedWord += letter;
    this.interacting = true;
  }
  dropWord(container, font) {
    this.guessedWord = "";
    this.interacting = false;

    for (let i = 1; i < container.children.length; i++) {
      const element = container.children[i];
      this.changeColor(element.getChildAt(0), element.getChildAt(1), 0, font);
    }
  }

  checkWord(container, font, letterContainer) {
    let found = NaN;
    if (this.interacting) {
      this.interacting = false;
      found = undefined;
      for (let i = 0; i < this.words.length; i++) {
        const element = this.words[i];
        if (element.word == this.guessedWord) {
          if (element.found) {
            found = element;
            break;
          }
          found = NaN;
          this.moveLetters(i, letterContainer, font);
          this.words[i].found = true;
        }
      }
      this.dropWord(container, font);
    }
    return found;
  }

  moveLetters(i, letterContainer, font) {
    let pos = 0;
    for (let j = 1; j < letterContainer.children.length; j++) {
      const letter = letterContainer.children[j];
      if (this.guessedWord.includes(letter.children[1].text)) {
        const targetWordHolder = this.words
          .find((x) => x.word == this.guessedWord)
          .holders.find((y) => y.letter == letter.children[1].text);
        const startX = letter.children[0].getGlobalPosition().x;
        const startY = letter.children[0].getGlobalPosition().y;
        const textElement = new Text(letter.children[1].text, font);

        textElement.anchor.set(0.5);
        textElement.x = startX;
        textElement.y = startY;
        textElement.alpha = 0;

        this.addChild(textElement);
        gsap.to(textElement, {
          duration: 1,
          alpha: 1,
          x: targetWordHolder.pos.getGlobalPosition().x,
          y: targetWordHolder.pos.getGlobalPosition().y,
          ease: "power1.out",
          delay: j * 0.1,
          onComplete: () => {
            this.removeChild(textElement);
            targetWordHolder.pos.tint = 0xff9933;
            const l = new Text(letter.children[1].text, {
              fontFamily: font.fontFamily,
              fontSize: font.fontSize,
              fill: "white",
            });
            l.anchor.set(0.5);
            this.addChild(l);
            l.x = targetWordHolder.pos.getGlobalPosition().x;
            l.y = targetWordHolder.pos.getGlobalPosition().y;


            this.endGame();
          },
        });
        pos++;
      }
    }
  }

  endGame(){
    let allDone = true;
    for (let i = 0; i < this.words.length; i++) {
      if(!this.words[i].found){
        allDone = false;
        return;
      } 
    }
    if(allDone){
      for (let j = this.children.length - 1; j > 0; j--) 
        this.removeChildAt(j);
      
      const blackness = Sprite.from("empty-box");
      blackness.scale.set(5);
      blackness.anchor.set(0.5);
      blackness.tint = 0x000000;
      blackness.x = GAME_WIDTH * 0.5;
      blackness.y = GAME_HEIGHT * 0.5
      blackness.alpha = 0.6;
      this.addChild(blackness);


      const playButton = Sprite.from("install-button");
      const playText = new Text("PLAY NOW!", this.playButtonFont);
      playText.anchor.set(0.5);
      playButton.addChild(playText);
  
      playButton.anchor.set(0.5);
      playButton.scale.set(1.4);
      playButton.x = GAME_WIDTH * 0.5;
      playButton.y = GAME_HEIGHT - 150;
      playButton.interactive = true;
      playButton.on("pointerdown", function () {
        window.open("#");
      });
      this.shrinkAnimation(playButton);
      this.addChild(playButton);

    }
  }
}
