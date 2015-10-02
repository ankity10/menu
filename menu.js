Items = new Mongo.Collection('items');
Orders = new Mongo.Collection('orders');


// MEnu databases start
cat_col = new Mongo.Collection('category');

dish_col = new Mongo.Collection('dish');

review_col = new Mongo.Collection('review');

order_col= new Mongo.Collection("order"); // no need to do anything
//menu databases end


//Session.set('current_cat','gBuAT6fw8YNFMwFkX');


if (Meteor.isClient) {
    var a = 2;
    Session.set("max_dish", a);
    Session.set("isLoaded", false);

    order_array=[];
Session.set("total_order",0);

    //console.log(Session.get("isLoaded"));

UI.registerHelper("total",function(){

    return Session.get("total_order");


});


    Template.top_box.events({
        "click a.back": function () {

            //console.log("hello world!");
            history.go(-1);
        },
        "keyup input.search-query": function (evt) {
            Session.set("search-query", evt.currentTarget.value);
            console.log(evt.currentTarget.value);

        }
    })

    Template.body.helpers({

        "isLoaded": function () {
            if (Session.get("isLoaded")) {
                return "none";
            } else {
                return "block"
            }
        },
        "total":function(){

        }



    })


    Template.body.events({

        "click a.link": function () {
            Session.set("isLoaded", false);
            console.log(Session.get("isLoaded"));
        }
    })

    Template.homescreen.helpers({
        'cat_var': function () {
            var keyword = Session.get("search-query");
            var query = new RegExp(keyword, 'i');
            return cat_col.find({$or: [{'name': query}]});
        },


    })

    Template.homescreen.events({

        'click div.card-image': function (evt) {
            Session.set("isLoaded", false);
            console.log(Session.get("isLoaded"));

            console.log("Anchor event works");


        }
    });

    Template.review.helpers({

        rev: function () {
            var dishid = Session.get("dish_id");
            var r = review_col.find({dish_id: dishid}).fetch();
            //console.log(r);
            return r;
        }

    });

    Template.dishscreen.events({

        'click div.col.s6': function (evt) {


            //alert(evt.ta);
            console.log($(evt.target).closest("div.c_wrap").attr("id"));
            var s = $(evt.target).closest("div.c_wrap").attr("id");
            var pre_div = Session.get('dish_id');
            if (s != pre_div)
                $("div.extension." + pre_div).slideUp("fast");


            Session.set("dish_id", s);
            //alert(Session.get('dish_id'));
            setTimeout(function () {

                $("div.extension." + s).slideToggle(300);

            }, 30);
        },

        'click a.addmore': function () {
            //alert("hello");
            var a = Session.get("max_dish");
            console.log("previous a :" + a);
            a = a + 2;
            console.log("final a :" + a);
            Session.set("max_dish", a);

            //Meteor._reload.reload();
        },
        "click .add-cart":function(evt){

            console.log($(evt.target).closest(".add-cart").attr("data-uid"));
            var uid=$(evt.target).closest(".add-cart").attr("data-uid");


            Session.set("total_order",Session.get("total_order")+1);
            console.log(Session.get("total_order"));
            Materialize.toast('Dish added in cart', 2000, 'rounded purple darken-3') // 'rounded' is the class I'm applying to the toast

            if(Session.get(uid)==undefined||Session.get(uid)==0){
                Session.set(uid,1);
                console.log("first count : "+Session.get(uid));
                order_array.push(uid);
                $("div.count."+uid).css("display","block");
                $("p.pcount."+uid).html(Session.get(uid));
                $("a.minus-cart."+uid).css("display","inline-block");

            }else{
                $("div.count."+uid).css("display","block");

                Session.set(uid,Session.get(uid)+1);
                console.log("new count : "+Session.get(uid));
                $("p.pcount."+uid).html(Session.get(uid));
                $(".minus-cart."+uid).css("display","inline-block");

            }

        },


        "click .minus-cart":function(evt){
            console.log($(evt.target).closest(".minus-cart").attr("data-uid"));
            var uid=$(evt.target).closest(".minus-cart").attr("data-uid");
            Session.set("total_order",Session.get("total_order")-1);
            console.log(Session.get("total_order"));
            Materialize.toast('Dish removed from cart', 2000, 'rounded purple darken-3') // 'rounded' is the class I'm applying to the toast

            Session.set(uid,Session.get(uid)-1);
            $("p.pcount."+uid).html(Session.get(uid));
            if(Session.get(uid)==0){

                $(".minus-cart."+uid).css("display","none");
                $("div.count."+uid).css("display","none");
                var index=order_array.indexOf(uid);
                if(index>-1){
                    order_array.splice(index,1);
                }
                console.log("removed");
            }



        }

    })

    //Router.route('/', function () {
    //    //alert(this.request.connection.remoteAddress);
    //    this.render('top_box');
    //    this.layout("top_box");
    //});



    Template.cart.helpers({

        'item':function(){

            obj2=[];
            var nm,pr,uid;
            for(i=0;i<order_array.length;i++){
                var s=dish_col.find({_id:order_array[i]});
                s.forEach(function(myobj){
                nm=myobj.name;
                pr=myobj.price;
                uid=myobj._id;
                });

                obj={
                    "name":nm,
                    "qty":Session.get(order_array[i]),
                    "price":pr,
                    "total_price":(pr*Session.get(order_array[i])),
                    "id":uid
                }




                obj2.push(obj);


            }




                Session.set("order",obj2);
            console.log(obj2);

            return obj2;
        },

        "o_total":function(){
            var overall_total=0;
            obj2=[];
            var nm,pr,uid;
            for(i=0;i<order_array.length;i++){
                var s=dish_col.find({_id:order_array[i]});
                s.forEach(function(myobj){
                    nm=myobj.name;
                    pr=myobj.price;
                    uid=myobj._id;
                });

                obj={
                    "name":nm,
                    "qty":Session.get(order_array[i]),
                    "price":pr,
                    "total_price":(pr*Session.get(order_array[i])),
                    "id":uid
                }
                overall_total+=obj.total_price;



                obj2.push(obj);


            }
            return overall_total;
        }

    })

    Template.cart.events({

        "click .minus-cartpage": function (evt) {
                           var a=$(evt.target).closest(".minus-cartpage").attr("data-uid");
            //console.log(Session.get(a));

            if(Session.get(a)==1){
                var test=confirm("Do you want to delete the dish from cart");

                if(test){
                    var index=order_array.indexOf(a);
                    Session.set(a,Session.get(a)-1);

                    if(index>-1){
                        order_array.splice(index,1);
                    }
                    Session.set("total_order",Session.get("total_order")-1);

                    Materialize.toast('Dish removed from cart', 2000, 'rounded purple darken-3') // 'rounded' is the class I'm applying to the toast

                }



            }else{
                Session.set(a,Session.get(a)-1);
                Session.set("total_order",Session.get("total_order")-1);
                Materialize.toast('Dish removed from cart', 2000, 'rounded purple darken-3') // 'rounded' is the class I'm applying to the toast


            }


        },

        "click .add-cartpage": function (evt) {
            var a=$(evt.target).closest(".add-cartpage").attr("data-uid");
            //console.log(Session.get(a));
            Session.set(a,Session.get(a)+1);
            Session.set("total_order",Session.get("total_order")+1);
            Materialize.toast('Dish added in cart', 2000, 'rounded purple darken-3') // 'rounded' is the class I'm applying to the toast


        },

        "click .co":function(){
            if(order_array.length!=0){

                order_array.splice(0,order_array.length);
                Session.set("total_order",0);
                $(".cart_desc").css("display","none");
                $(".order_heading").css("display","block");

                order_col.insert({
                    'user':Meteor.userId(),
                    'order':Session.get("order"),
                    'at':Date(),

                })
            }else{
                Materialize.toast("Empty Cart..can't place order", 2000, 'rounded purple darken-3') // 'rounded' is the class I'm applying to the toast

            }



        }


    })


    Template.admin.helpers({

        "order_list":function(){

            return order_col.find({}).fetch();
        }

    });


    Template.admin.events({
        "click .l-wrap":function(evt){

            var a=$(evt.target).closest("div.l-wrap").attr("data-uid");
            console.log(a);
            $(".o-desc-wrap."+Session.get("active")).css("display","none");
            $(".o-desc-wrap."+a).css("display","block");
            Session.set("active",a);
            //alert("hello");
        }


    });


    Router.configure({
        layoutTemplate: 'top_box'
    });


    Router.map(function(){
        this.route("cart",{path:"/cart"})

    });

    Router.map(function () {

        this.route('admin', {path: '/admin'});

     setTimeout(function(){


         var uid= $(".llist > .l-wrap").attr("data-uid");
         $(".o-desc-wrap."+uid).css("display","block");
Session.set("active",uid);
         console.log(uid);
     },500);




    });


    Router.map(function () {

        this.route('login', {path: '/'});
        setTimeout(function () {
            Session.set("isLoaded", true);
            console.log(Session.get("isLoaded"));

            $(".m-menu-active").sideNav();
            //alert("hello");

        }, 300);

    });


    //Router.route('/', function () {
    //    this.render('login');
    //    setTimeout(function () {
    //        Session.set("isLoaded", true);
    //        console.log(Session.get("isLoaded"));
    //
    //        $(".m-menu-active").sideNav();
    //        //alert("hello");
    //
    //    }, 300);
    //});



    Template.homescreen.onRendered(function () {
        Session.set("isLoaded", true);
        console.log(Session.get("isLoaded"));
        $(".m-menu-active").sideNav();
    });
    Template.dishscreen.onRendered(function () {
        Session.set("isLoaded", true);
        console.log(Session.get("isLoaded"));
        $(".m-menu-active").sideNav();
    });


    Template.cart.onRendered(function () {
        Session.set("isLoaded", true);
        console.log(Session.get("isLoaded"));
        $(".m-menu-active").sideNav();
    });

    Router.route('/dish/:_id',
        function () {
            // $('.materialboxed').materialbox();




            var a = 2;
            Session.set("isLoaded", true);
            //
            console.log(Session.get("isLoaded"));

            Session.set("max_dish", a);
            this.render("dishscreen");




            setTimeout(function(){
                var l=order_array.length;
                console.log(order_array);
                for(i=0;i<l;i++){
                    $("div.count."+order_array[i]).css("display","block");
                    $("a.minus-cart."+order_array[i]).css("display","none");


                    console.log(Session.get(order_array[i]));
                    $("p.pcount."+order_array[i]).html(Session.get(order_array[i]));

                }
                console.log("done");

            },500);


        },
        {
            data: function () {
                var keyword = Session.get("search-query");
                var query = new RegExp(keyword, 'i');
                //console.log(this.params._id);
                //console.log(dish_col.find({category_id:this.params._id}).fetch());
                var dat = dish_col.find({
                    $or: [{'name': query}],
                    'category_id': this.params._id
                }, {limit: Session.get('max_dish')}).fetch();
                template_data = {
                    dishes_by_cat: dat,
                    categ_name: cat_col.find({_id: this.params._id})
                }

                return template_data;


            }


        });


}

if (Meteor.isServer) {

order_col.remove({});



    var uid = 'RNfS4JdBouTR8e6kv';
    Roles.addUsersToRoles(uid, 'admin');
    Meteor.startup(function () {


        // code to run on server at startup
    });
}
