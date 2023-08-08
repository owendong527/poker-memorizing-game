const GAME_STATE = {  //定義了遊戲狀態
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
}
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]
const view = {
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `<p>${number}</p>
        <img src="${symbol}" />
        <p>${number}</p>`
  },

  //把這裡改成得到的牌都是背面，而翻開裡面的花色和數字改在上面點擊時才執行的getCardContent函式
  getCardElement(index) {
    // class= "card back" 因為一開始牌都是背面朝上的狀態 所以加了一個back
    return `<div data-index="${index}" class="card back">
   </div>`
  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    //rootElement.innerHTML = this.getCardElement(1)
    // 上面是帶入一個數字產生一張牌卡 下面是用迭代方式產生52張

    // rootElement.innerHTML = Array.from(Array(52).keys()).map(index => this.getCardElement(index)).join('')

    //上面Array.from(Array(52).keys())是順序的0~51，換成套用utility 裡的 getRandomNumberArray 被洗亂的陣列

    // rootElement.innerHTML = utility.getRandomNumberArray(52).map(index => this.getCardElement(index)).join('')

    // 這裡可以讓這函式更單一的功能，只用來顯示 打亂數字的陣列
    // 為了降低耦合 而打亂數字順序的函式utility.getRandomNumberArray就不在這呼叫，改到controller裡的 generateCards 函式
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },

  //flipCard(card)  為了優化程式碼讓下面213 214行 不要一直重複寫flipCard 因為要一次處理很多card所以加上複數
  //  ...cards 就是陣列 ，舉例可以把五張cards變成五個元素的陣列 = [1,2,3,4,5] ，原本呼叫只有一張牌 現在變複數和spread 就是可以一次放入很多張牌而這些牌會變成陣列然後當成參數傳入
  flipCards(...cards) {
    // console.log(card.dataset.index)
    cards.map(card => {
      if (card.classList.contains('back')) {
        //如果背面朝上 點擊 會回傳正面
        card.classList.remove('back')
        //在getCardElement 裡的HTML新增data-index 讓這裡點擊時可以取得到每張牌的編號index，再放到getCardContent裡去渲染出是什麼數字和花色
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      //如果正面朝上 點擊 會回傳背面
      card.classList.add('back')
      card.innerHTML = null //清空 因為傳回背面的狀態是不會有數字的
    })

  },

  //配對成功的話 增加一個paired的class 然後去css設定配對成功的樣式
  //pairCard(card) {    因為62行flipCard做優化 這裡也是做一樣的優化 一次可以傳入不只一個的參數了
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired') 
    })
  },

  //88 92行呼應model的分數和次數
  renderScore(score) {
    document.querySelector('.score').textContent = `score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times`
  },

  //翻牌失敗會有錯誤的樣式 的函式   現在css設定動畫和class 這裡設定把傳進來的牌加上 wrong的class 去吃到wrong的css樣式
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', e => {
        card.classList.remove('wrong')
        //css他無法重複播放 所以要利用再建立一個監聽器，在animationend 動畫1s播完的時候移除wrong 這樣動畫就可以重播了
      })
    },
      {
        once: true  //效果是這addEventListener 只會觸發一次性的  觸發完之後就會立刻消失
      }
    )
  },

  // 在 view 中新增 結束遊戲的函式
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

//因為是外面拿回來的套件做打亂陣列 所以用一個MVC以外的名稱 utility 在設定
const utility = {
  getRandomNumberArray(count) { //count表示陣列的長度，本專案的情境會傳入52（牌的數量）
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {  //取從最後一張往前到 index = 1是倒數第二張為止
      let randomIndex = Math.floor(Math.random() * (index + 1)) //從最後的index = 51 +1 ，randomIndex才會是取 0~51隨機一個數 總共52個數字
      //如果非解構賦值要交換陣列裡的元素
      //[1,2,3,4,5] 要交換 1 5
      // const temp = 1 先把1存起來
      // arr[4] = temp
      // arr[0] = 5
      // 下面是有解構賦值時只要很語意的對位置就交換了
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

//設定model,資料的管理 所以任何跟資料有關的都存放在這裡面。在這個專案裡面最重要的資料 是他必須要知道說 目前它翻出來的牌是哪兩張
const model = {   
  //暫存牌組，使用者每次翻牌時，就先把卡片丟進這個牌組，集滿兩張牌時就要檢查配對有沒有成功，檢查完以後，這個暫存牌組就需要清空。
  revealedCards: [],  

  //此function model 的第一張牌和第二張牌是否是一樣的
  isRevealedCardsMatch() { 
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  //最後要設置標頭的分數和次數
  score: 0,
  triedTimes: 0
}

// controller 會依遊戲狀態來分配動作，在這裡我們也定義一個 currentState 屬性，用來標記目前的遊戲狀態。
const controller = {
  //狀態是定義在controller裡面的,在這也指定了初始狀態 而起始狀態就是FirstCardAwaits
  currentState: GAME_STATE.FirstCardAwaits, //準備翻第一張牌 還沒翻牌

  //game start
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  //依照不同的遊戲狀態，做不同的行為
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {  //如果沒有牌背class的話就是顯示字那面就直接結束不要再做任何事了
      return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits //在 FirstCardAwaits 狀態點擊卡片的話，會將卡片翻開，然後進入 SecondCardAwaits 狀態
        break

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)  //+號 在前面的才會先加好次數 像一開始翻第一次然後加好1後傳去renderTriedTimes去渲染成第一次，不然model.triedTimes++ 第一次翻牌時，triedTime會是0，就被先傳到renderTriedTimes，第一次玩翻牌的時候會顯示You've tried: 0 times，但實際上應該要是You've tried: 1 times才是合理的。

        view.flipCards(card)
        model.revealedCards.push(card)
        //當第二張也推進的時候會有個分歧 ,在 SecondCardAwaits 狀態點擊卡片的話，會將卡片翻開，接著檢查翻開的兩張卡是否數字相同
        //翻開兩張卡牌後，需要比對卡牌的點數大小，因此要從 model 的記錄中，找到前一張翻開的卡牌，以便檢查配對

        //判斷配對是否成功
        if (model.isRevealedCardsMatch()) { //配對正確會回傳 布林值 true 這樣就繼續往大括號裡面走
          //配對正確 ,會停留場上
          view.renderScore(model.score += 10) //配對成功 +10分

          this.currentState = GAME_STATE.CardsMatched
          //view.pairCard(model.revealedCards[0])
          //view.pairCard(model.revealedCards[1])
          //view.pairCards(...model.revealedCards)
          //model.revealedCards =[]    要清空暫存的陣列
          //this.currentState = GAME_STATE.FirstCardAwaits  當配對成功後再把狀態變回起始狀態
          view.pairCards(...model.revealedCards)
          model.revealedCards = []

          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits //當配對成功後再把狀態變回起始狀態
        } else {
          //配對失敗 , 會蓋回去背面
          this.currentState = GAME_STATE.CardsMatchFailed

          //設定serTimeout讓配對失敗停留一下再翻回背面給user時間記憶牌組
          //setTimeout(()=>{
            //view.flipCard(model.revealedCards[0])
            //view.flipCard(model.revealedCards[1])
            //view.flipCards(...model.revealedCards)  上面flipCard優化 這裡也改成...
            //model.revealedCards =[]    要清空暫存的陣列
            //this.currentState = GAME_STATE.FirstCardAwaits
          // },1000)
          view.appendWrongAnimation(...model.revealedCards)
          
          // setTimeout(this.resetCards , 1500)  兩個setTimeout的寫法都可以
          setTimeout(() => this.resetCards(), 1500)
          //瀏覽器提供給 JavaScript 使用的 API，可以呼叫瀏覽器內建的計時器

        }
        break

    }
    console.log('current state:', this.currentState)
    console.log('revealed Cards:', model.revealedCards.map(card => card.dataset.index))
  },


  //因為213行 配對失敗的setTimeout 寫在裡面動作看起來會太亂 所以拉出來寫一個函式
  resetCards() {
    view.flipCards(...model.revealedCards) //卡片蓋回去
    model.revealedCards = []    //把暫存的卡片清掉
    controller.currentState = GAME_STATE.FirstCardAwaits //切回第一個狀態
  }
}

controller.generateCards()

// view.displayCards() 有了controller做溝通協調的工作去呼叫view跟model，以後就不會在global的地方去呼叫view。
//之後就會在controller裡面的 寫在generateCards裡面去 像是game start的function

//Node List(array-like)
//這裡不能用map 用forEach 是因為他不是真的陣列
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    // console.log(card)
    // view.flipCard(card)
    // view.appendWrongAnimation(card)
    controller.dispatchCardAction(card)
  })
})


//當物件的屬性與函式/變數名稱相同時，可以省略不寫
  // 原本的寫法
  // const view = {
  //   displayCards: function displayCards() { ...  }
  // }
// 省略後的寫法
  // const view = {
  //   displayCards() { ...  }
  // }


  // 現在讓我們調整架構，不要讓 controller 以外的內部函式暴露在 global 的區域。
  // 要調整的地方如下：
  // 由 controller 啟動遊戲初始化，在 controller 內部呼叫 view.displayCards
  // 由 controller 來呼叫 utility.getRandomNumberArray，避免 view 和 utility 產生接觸，可以看47~57行
  


  //如果只有一個值，就會在傳進 flipCards 的時候，被三個點變成陣列。
  //217行如果model.revealedCards是傳入陣列，就會先用 ... 展開成個別值，再於傳進 flipCards 的時候，又被 ... 變成陣列。
