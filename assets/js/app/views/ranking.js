$(function() {
    var TopicsView = App.ModelView.extend({
        template: TPL['topic-ranking'],
        render:function(){
            var candidates = this.model.get('candidates');
            this.model.set('candidates',_.sortBy(candidates,function(c){
                return -c.score;
            }));
            App.ModelView.prototype.render.call(this);
        }
    });
    
    App.Pages.Ranking = new (App.PageView.extend({
        events: {
            'click .header-btn-left': 'onClickLeftBtn',
            'click .header-btn-right': 'onClickRightBtn',
            'webkitAnimationEnd .wellbox': 'flipEnd',
            'click .avatar': 'viewImage',
            'click .fa':'likeIt'
        },
        clearLikeTimes:function(){
            var now = new Date().getTime();
            if(now - window.localStorage.getItem('like_timestamp')>24*3600*1000){
                window.localStorage.removeItem('like_times');
                window.localStorage.removeItem('like_timestamp');
            }
        },
        likeIt:function(e){
            $(e.currentTarget).removeClass('like');
            var like_times;
            if(!window.localStorage.getItem('like_times')){
                window.localStorage.setItem('like_timestamp',new Date().getTime());
                like_times=0;
            }
            else{
                var like_times=parseInt(window.localStorage.getItem('like_times'));
            }
            if(like_times<=3){
                var id = $(e.currentTarget).attr('data-id');
                var scoreP=$(e.currentTarget).siblings('.score');
                scoreP.text('Score:'+(parseInt(scoreP.text().substr(6))+1));
                new (Backbone.Model.extend({urlRoot: App.configs.APIHost + '/topics/candidate/'+id+'/like/'}))().save();
                window.localStorage.setItem('like_times',like_times+1);
                setTimeout(function(){
                    $(e.currentTarget).addClass('like');
                },0);
            }
            else{
                alert('每天最多只能投3次');
            }
            e.preventDefault();
        },
        flipEnd: function(e) {
            if (e.originalEvent.animationName == "flip") {
                $(e.currentTarget).removeClass('animate');
                if(!App.Pages.Ranking.first){
                    this.options.topic = App.Pages.Home.topicAttrs;
                    this.topic.set(this.options.topic);
                    App.Pages.Ranking.first=true;
                }
            }
        },
        onClickRightBtn: function(){
            App.Pages.Ranking.first=false;
            App.Pages.Home.renderTopic();
            this.$('.wellbox').addClass('animate');
        },
        initPage: function() {
            this.clearLikeTimes();
            this.topic = new App.Models.Topic();
            this.views = {
                topic: new TopicsView({
                    el: this.$('.wrapper'),
                    model: this.topic
                })
            };
        },
        viewImage: function(e) {
            var $avatar = $(e.currentTarget);
            var $fullscreen = this.$('.fullscreen');
            if ($fullscreen.hasClass('invisible')) {
                $fullscreen.css('background-image', $avatar.css('background-image'));
                $fullscreen.removeClass('invisible');
                $fullscreen.one('click', function() {
                    $(this).addClass('invisible');
                });
            }
        },
        render: function() {
            if (this.options.topicId) {
                this.topic.clear();
                this.topic.set({id: this.options.topicId});
                this.topic.fetch();
            } else if (this.options.topic) {
                this.topic.set(this.options.topic);
            }
        }
    }))({el: $("#view-ranking")});
});
