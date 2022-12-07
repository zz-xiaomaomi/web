/**
 *
 * @param {*} dom 要绑定事件的 dom 元素
 * @param {*} fn1 鼠标移入的时候要做的事情
 * @param {*} fn2 鼠标移出的时候要做的事情
 */
function hover(dom, fn1, fn2) {
  dom.addEventListener("mouseenter", fn1);
  dom.addEventListener("mouseleave", fn2);
}

function fadeIn(dom, self) {
  dom.style.transition = ".5s";
  dom.style.opacity = 1;
  dom.ontransitionend = function () {
    // 过渡效果结束后，会触发此事件
    // 关闭 tanransition 过渡
    dom.style.transition = "none";
    dom.ontransitionend = null;
    // 打开锁
    self.lock = false;
  };
}

function fadeOut(dom) {
  dom.style.transition = ".5s";
  dom.style.opacity = 0;
  dom.ontransitionend = function () {
    // 过渡效果结束后，会触发此事件
    // 关闭 tanransition 过渡
    dom.style.transition = "none";
    dom.ontransitionend = null;
  };
}

/**
 *
 * @param {*} dom 要修改哪一个 dom 元素
 * @param {*} cssObj 对应要修改的样式是什么？
 * @param {*} self swiper 的实例对象
 */
function animate(dom, cssObj, self) {
  dom.style.transition = ".5s";
  for (var key in cssObj) {
    dom.style[key] = cssObj[key];
  }
  dom.ontransitionend = function () {
    // 过渡效果结束后，会触发此事件
    // 关闭 tanransition 过渡
    dom.style.transition = "none";
    dom.ontransitionend = null;
    // 打开锁
    self.lock = false;
  };
}

/**
 *
 * @param {*} options 轮播图配置对象
 */
function Swiper(options) {
  // 首先第一步，将配置对象上面的各个属性存储到 swiper 实例对象上面
  this.wrapStr = options.wrap; // 容器的字符串
  this.wrap = document.querySelector(options.wrap); // 轮播图容器的 DOM 节点
  this.contentList = document.querySelectorAll(options.contentList); // 轮播图的内容的 DOM 节点集合
  this.autoChangeTime = options.autoChangeTime || 5000; // 自动播放的时间
  // 所以这里就是以此类推，将用户整个 options 配置对象的属性都存储到 this 上面
  this.type = options.type || "fade"; // 播放的方式
  this.isAuto = options.isAuto === undefined ? true : !!options.isAuto; // 是否自动轮播
  // 左右按钮的显示状态，共有 3 种
  // 1. always 代表一支显示   2. hide 代表隐藏    3. hover 移入显示
  this.showChangeBtn = options.showChangeBtn || "always";
  // 是否显示小圆点
  this.showSpots = options.showSpots == undefined ? true : !!options.showSpots;
  // 小圆点的大小
  this.spotSize = options.spotSize || 5;
  // 小圆点的位置，可选值有 3 个
  // 1. left 2. center 3. right
  this.spotPosition = options.spotPosition || "center";
  // 小圆点的背景颜色
  this.spotColor = options.spotColor || "rgba(255,255,255,.4)";
  // 当前图片的小圆点的颜色
  this.curSpotColor = options.curSpotColor || "red";
  this.width = options.width || $(wrap).width(); // 轮播图容器的宽度
  this.height = options.height || $(wrap).height(); // 轮播图容器的高度

  // 除了上面用户传递的属性，我们还需要一些额外的属性
  this.len = this.contentList.length;
  this.nowIndex = 0; // 当前轮播图的索引值
  this.timer = null; // 自动轮播图的计时器
  this.lock = false; // 是否锁住，不切换下一张

  // 属性初始化完毕后，就需要进行整个轮播图的初始化
  this.init();
}

/**
 * 初始化轮播图的方法
 */
Swiper.prototype.init = function () {
  // 1. 创建轮播图的结构
  // 因为用户所书写的结构并非最终渲染到浏览器的 DOM 结构
  // 很多元素用户是没有书写（下面的指示器、左右的轮播按钮，这些都应该是插件来帮助生成）
  this.createElement();

  // 2. 初始化轮播图的样式
  // 针对这个插件，有一部分固定的样式
  // 但是有一部分样式是固定不下来，这部分样式是根据用户的配置而决定的
  this.initStyle();

  // 3. 绑定功能
  this.bindEvent();

  // 4. 自动播放
  if (this.isAuto) {
    this.autoChange();
  }
};

/**
 * 初始化轮播图结构方法
 */
Swiper.prototype.createElement = function () {
  // 1. 创建对应的公共结构

  // 创建轮播图的整个包裹层
  var swiperWrapper = document.createElement("div");
  swiperWrapper.classList.add("my-swiper-wrapper");

  // 创建轮播图的内容区
  var swiperItems = document.createElement("ul");
  swiperItems.classList.add("my-swiper-items");

  // 轮播图小圆点容器
  var spotsWrapper = document.createElement("div");
  spotsWrapper.classList.add("my-swiper-spots");

  // 创建左右按钮
  var leftBtn = document.createElement("div");
  leftBtn.className = "my-swiper-btn my-swiper-lbtn";
  leftBtn.innerHTML = `<i class="iconfont">&#xe628;</i>`;

  var rightBtn = document.createElement("div");
  rightBtn.className = "my-swiper-btn my-swiper-rbtn";
  rightBtn.innerHTML = `<i class="iconfont">&#xe625;</i>`;

  // 接下来下一步，我们需要将用户传递过来的轮播项目放入到 li 元素里面
  for (var i = 0; i < this.len; i++) {
    // 创建 li
    var li = document.createElement("li");
    li.classList.add("my-swiper-item");
    // 添加用户所书写的轮播项目
    li.appendChild(this.contentList[i]);

    // 将 li 添加到 ul 里面
    swiperItems.appendChild(li);

    // 添加对应的小圆点
    var span = document.createElement("span");
    span.dataset.id = i;
    spotsWrapper.appendChild(span);
  }

  // 2. 根据用户的配置，书写不同的结构
  if (this.type === "animate") {
    // 进入该 if，说明是从左往右轮播，我们需要将第一张图片复制一份放到最后
    var cloneLi = swiperItems.children[0].cloneNode(true);
    swiperItems.appendChild(cloneLi);
  }

  // 3. 根据用户所选择的按钮的状态，结构也要单独处理
  switch (this.showChangeBtn) {
    case "hide": {
      leftBtn.style.display = "none";
      rightBtn.style.display = "none";
      break;
    }
    case "hover": {
      leftBtn.style.display = "none";
      rightBtn.style.display = "none";
      hover(
        swiperWrapper,
        function () {
          leftBtn.style.display = "block";
          rightBtn.style.display = "block";
        },
        function () {
          leftBtn.style.display = "none";
          rightBtn.style.display = "none";
        }
      );
      break;
    }
    default: {
      break;
    }
  }

  // 4. 小圆点是否要显示
  if (!this.showSpots) {
    spotsWrapper.style.display = "none";
  }

  // 5. 添加我们所创建的 DOM 元素
  swiperWrapper.appendChild(swiperItems); // 添加 ul
  swiperWrapper.appendChild(leftBtn); // 左按钮
  swiperWrapper.appendChild(rightBtn); // 右按钮
  swiperWrapper.appendChild(spotsWrapper); // 小圆点
  swiperWrapper.classList.add(`my-swiper-wrapper_${this.type}`);

  // 清空原来的内容，将我们的内容添加上去
  this.wrap.innerHTML = "";
  this.wrap.appendChild(swiperWrapper);
};

/**
 * 初始化轮播图的样式
 */
Swiper.prototype.initStyle = function () {
  // 1. 轮播图区域整体的大小
  // 不同的轮播方式，所对应的 ul 的宽度是不相同的
  var ul = document.querySelector(this.wrapStr + " .my-swiper-items"); // ".demo .my-swiper-items"
  ul.style.width =
    this.type === "animate"
      ? this.width * (this.len + 1) + "px"
      : this.width + "px";
  ul.style.height = this.height + "px";

  // 2. 根据轮播图的类型来设置第一张轮播图
  if (this.type === "fade") {
    // 淡入淡出，设置第一张图片为不透明
    document.querySelectorAll(this.wrapStr + " .my-swiper-item")[
      this.nowIndex
    ].style.opacity = 1;
  } else {
    // 从左往右
    // 设置 ul 的 left 值
    document.querySelector(this.wrapStr + " .my-swiper-items").style.left =
      -this.nowIndex * this.width + "px";
  }

  // 3. 设置小圆点
  var spots = document.querySelector(this.wrapStr + " .my-swiper-spots");
  spots.style.textAlign = this.spotPosition;
  spots.style.display = this.showSpots ? "block" : "none";
  // 设置每一个小圆点对应的大小和颜色
  var spans = document.querySelectorAll(
    this.wrapStr + " .my-swiper-spots span"
  );
  for (var i = 0; i < spans.length; i++) {
    spans[i].style.width = this.spotSize + "px";
    spans[i].style.height = this.spotSize + "px";
    spans[i].style.backgroundColor = this.spotColor;
  }
  // 针对当前的小圆点设置当前小圆点的颜色
  // 假设我们有三张图片，下标对应 0 1 2
  // 淡入淡出 ---> 0 1 2
  // 从左往右 ---> 0 1 2 3 % 3 ---> 0 1 2 0
  spans[this.nowIndex % this.len].style.backgroundColor = this.curSpotColor;
};

/**
 * 轮播图绑定事件
 */
Swiper.prototype.bindEvent = function () {
  // 保存 this 的指向
  var self = this;
  // 思考：有哪些事件？
  // 上一张下一张
  // 指示器事件
  // 鼠标移入停止播放移出继续播放
  // 自动播放

  // 左边按钮（上一张）
  document
    .querySelector(this.wrapStr + " .my-swiper-lbtn")
    .addEventListener("click", function () {
      if (self.lock) {
        return;
      }

      self.lock = true;

      if (self.type == "fade") {
        if (self.nowIndex === 0) {
          // 说明当前已经是第一张了，我们需要跳转到最后一张
          self.nowIndex = self.len - 1;
        } else {
          self.nowIndex--;
        }
      } else {
        if (self.nowIndex === 0) {
          document.querySelector(
            self.wrapStr + " .my-swiper-items"
          ).style.left = -self.len * self.width + "px";
          document.querySelector(self.wrapStr + " .my-swiper-items")
            .clientWidth;
          self.nowIndex = self.len - 1;
        } else {
          self.nowIndex--;
        }
      }
      self.change();
    });

  // 右边按钮（下一张）
  // 核心逻辑实际上就是修改当前图片的下标，下标更新后，根据当前的下标显示对应的图片即可
  document
    .querySelector(this.wrapStr + " .my-swiper-rbtn")
    .addEventListener("click", function () {
      if (self.lock) {
        // 进入这个 if，说明目前处于两张图片切换当中
        // 当前不允许切换下一张
        return;
      }

      self.lock = true;

      if (self.type === "fade") {
        // 淡入淡出
        if (self.nowIndex === self.len - 1) {
          self.nowIndex = 0;
        } else {
          self.nowIndex++;
        }
      } else {
        // 从左往右
        if (self.nowIndex === self.len) {
          document.querySelector(
            self.wrapStr + " .my-swiper-items"
          ).style.left = "0px";
          // 注意，这里有一个细节，而且这个细节还涉及到了浏览器渲染原理部分的知识
          // 因为我们在短时间内多次修改了 left 值，导致浏览器会自动的合并这两次修改
          // 所以这里我们需要浏览器强制重新渲染一次，我们这里只需要通过去读取浏览器某一个布局的属性即可
          // 当你读取某一个布局属性时，浏览器会强制回流
          document.querySelector(self.wrapStr + " .my-swiper-items")
            .clientWidth;
          self.nowIndex = 1;
        } else {
          self.nowIndex++;
        }
      }
      self.change();
    });

  // 指示器事件
  document
    .querySelector(this.wrapStr + " .my-swiper-spots")
    .addEventListener("click", function (e) {
      if (e.target.nodeName === "SPAN") {
        if (self.lock) {
          return;
        }
        self.lock = true;
        var i = e.target.dataset.id;
        self.nowIndex = i;
        self.change();
      }
    });

  // 鼠标移入移出
  hover(
    self.wrap,
    function () {
      clearInterval(self.timer);
    },
    function () {
      if (self.isAuto) {
        self.autoChange();
      }
    }
  );
};

/**
 * 根据当前的下标显示对应的图片
 */
Swiper.prototype.change = function () {
  var self = this;
  // 1. 更新图片
  if (this.type === "fade") {
    // 核心思路：先将所有的图片都设置为透明，然后再将当前的图片设置为不透明
    var lis = document.querySelectorAll(self.wrapStr + " .my-swiper-item"); // ".demo .my-swiper-item"
    for (var i = 0; i < lis.length; i++) {
      // lis[i].style.opacity = 0;
      fadeOut(lis[i]);
    }
    // lis[self.nowIndex].style.opacity = 1;
    fadeIn(lis[self.nowIndex], self);
  } else {
    var ul = document.querySelector(self.wrapStr + " .my-swiper-items");
    animate(
      ul,
      {
        left: -self.nowIndex * self.width + "px",
      },
      self
    );
  }

  // 2. 更新小圆点
  var spans = document.querySelectorAll(
    self.wrapStr + " .my-swiper-spots>span"
  );
  // 先将所有的 span 设置为固定背景颜色
  for (var i = 0; i < spans.length; i++) {
    spans[i].style.backgroundColor = self.spotColor;
  }
  // 然后再将当前的 span 设置为当前颜色
  spans[self.nowIndex % self.len].style.backgroundColor = self.curSpotColor;
};

/**
 * 自动播放
 */
Swiper.prototype.autoChange = function () {
  var self = this;
  // 就是不停的触发右边按钮的点击事件
  clearInterval(self.timer);
  self.timer = setInterval(function () {
    console.log("object");
    document.querySelector(self.wrapStr + " .my-swiper-rbtn").click();
  }, self.autoChangeTime);
};
