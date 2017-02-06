$(document).ready(function ()
{
    var Item = Backbone.Model.extend({
    });

    var ItemCollection = Backbone.Collection.extend({
        model: Item,
        comparator: function (item)
        {
            return item.get("id");
        }
    });

    var UserView = Backbone.View.extend({

        el: $('#profiles'),
        template: _.template($('#profileTemplate').html()),
        render: function(eventName) {
            _.each(this.model.models, function(profile){
                var profileTemplate = this.template(profile.toJSON());
                $(this.el).append(profileTemplate);
            }, this);

            return this;
        }
    });

    var PostsView = Backbone.View.extend({
      el: $('#posts'),
      template: _.template($('#postsTemplate').html()),
      render: function(eventName) {
          _.each(this.model.models, function(posts){
              var postsTemplate = this.template(posts.toJSON());
              $(this.el).append(postsTemplate);
          }, this);

          return this;
      },
      events: {
        "click .edit" : "editpost"
      },
      editpost: function (e) {
        e.preventDefault();
        var ide = $(e.currentTarget).attr("id");
        $.fn.editable.defaults.mode = 'popup';
        //make status editable
        $('#'+ide).click(function(e){
          e.stopPropagation();

          $('#body'+ide).editable('toggle');

          });
        $('#body'+ide).editable({
            type: 'text',
            title: 'Edit Post',
            placement: 'top',
            savenochange: true,
            pk:1,
            toggle:'manual'
        }).on('save',function(){
          swal("Good job!", "Post Updated Succesfully", "success")
          setTimeout( function(){
            var text = $('#body'+ide).text();
            $.ajax('http://jsonplaceholder.typicode.com/posts/'+ide, {
              method: 'PATCH',
              data: {
                title: 'updated',
                userId:ide,
                body:text
              }
            }).then(function(data) {

              console.log(data);
            });
            }  , 1000 );
        });


          }
    });

    var CommentsView = Backbone.View.extend({
      el: $('#pcomments'),
      template: _.template($('#commentsTemplate').html()),
      render: function(eventName) {
          _.each(this.model.models, function(comments){
              var commentsTemplate = this.template(comments.toJSON());
              $(this.el).append(commentsTemplate);
          }, this);

          return this;
      }
    });


    var NavigationRouter = Backbone.Router.extend({
        _data: null,
        _items: null,
        _view: null,

        routes: {
            "posts/:id": "showPosts",
            "comments/:id": "showComments",
            "/": "initialize"
        },
        initialize: function (options)
        {
            $('.loader').show();
            var _this = this;
            $.ajax({
                url: "http://jsonplaceholder.typicode.com/users",
                dataType: 'json',
                data: {},
                async: false,
                success: function (data)
                {

                    _this._data = data;
                    _this._items = new ItemCollection(data);
                    _this._view = new UserView({ model: _this._items });
                    _this._view.render();
                    setTimeout( function(){
                      $('.loader').hide();
                      $('#profiles').show();
                    }, 3000 );

                }

            });

            return this;
        },
        defaultRoute: function (actions)
        {
            this.initialize();
        },
        showPosts: function (id)
        {
          $('#profiles').hide();
          $('#posts').hide();
          $('.loader').show();
          $('#comments').hide();
          var _this = this;
          $.ajax({
              url: "http://jsonplaceholder.typicode.com/posts/?userId="+id,
              dataType: 'json',
              data: {},
              async: false,
              success: function (data)
              {
                  _this._data = data;
                  _this._items = new ItemCollection(data);
                  _this._view = new PostsView({ model: _this._items});
                  _this._view.render();
                  setTimeout( function(){
                    $('.loader').hide();
                    $('#posts').show();
                  }, 3000 );

              }

          });
            return this;
        },
        showComments: function (id)
        {
          $('#posts').hide();
          $('.loader').show();
          $('#profiles').hide();
          var title = $('#title'+id).text().slice(8);
          var text = $('#body'+id).text();
          $('#ptitle').html(title);
          $('#pbody').html(text);

          var _this = this;
          $.ajax({
              url: "http://jsonplaceholder.typicode.com/posts/"+id+"/comments",
              dataType: 'json',
              data: {},
              async: false,
              success: function (data)
              {
                  _this._data = data;
                  _this._items = new ItemCollection(data);
                  _this._view = new CommentsView({ model: _this._items});
                  _this._view.render();
                  setTimeout( function(){
                    $('.loader').hide();
                    $('#comments').show();
                  }, 3000 );

              }

          });
            return this;
        }
    });

    var navigationRouter = new NavigationRouter;
    Backbone.history.start();
});
