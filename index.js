var interval;
var changeHash = true;
var	texto_janela_modal;
var slider = $("#slider");
var slide_quantidade = slide_quantidade || 1;
var windowW = $(window).width();
var produtoCarregado = false;
var timeoutBOX = 0;
var FBAddToCartDetail = FBAddToCartDetail || true;
var allowColorScrollMobile;

jQuery.event.special.touchstart = {
	setup: function( _, ns, handle ) {
		this.addEventListener("touchstart", handle, { passive: !ns.includes("noPreventDefault") });
	}
};
jQuery.event.special.touchmove = {
	setup: function( _, ns, handle ) {
		this.addEventListener("touchmove", handle, { passive: !ns.includes("noPreventDefault") });
	}
};
jQuery.event.special.wheel = {
	setup: function( _, ns, handle ){
		this.addEventListener("wheel", handle, { passive: true });
	}
};
jQuery.event.special.mousewheel = {
	setup: function( _, ns, handle ){
		this.addEventListener("mousewheel", handle, { passive: true });
	}
};
$(function(){
	findComponent();
	findWidget();
	loadCompraRapida();
	findOwlAuto();
	
	$('img[data-await]').each(function(){
		let _th = $(this);
		_th.attr('src', _th.data('await'));
	});
	
	if(typeof masonry === "function"){
		$('.drop .grid').masonry({
			itemSelector: '.list',
			gutter: 10,
		});
	}
	
	// abre e fecha o menu
	$('.openmenu').click(function(e){
		e.preventDefault();
		$('#mobile-menu').toggleClass('open');
		document.location.hash = '#menu';
		$('body').addClass('no-scroll');
	});
	$('header').on('click', '#mobile-menu', function(e){
		if(!$(e.target).closest("#mobile-menu .nav, #mobile-menu .b-desconectar").length)
			window.history.back();
	});
	
	$(window).on('popstate', function(){
		let hash = document.location.hash;
		if(hash == ''){
			$('#mobile-menu').removeClass('open');
			$('header .search').removeClass('open');
			$('header .search .cover').removeClass('close');
			$('body').removeClass('no-scroll');
		}
	});
	//
	
	// busca
	$('header .search').on('click', '.cover', function(e){
		$(this).addClass('close');
		$('header .search').addClass('open');
		$('header .search input').focus();
		document.location.hash = '#search';
	});
	
	$('header .search .rm').click(function(e){
		window.history.back();
	});
	//

	// carrinho suspenso
	$('.suspended-cart').on('click', '.cover, .fechar', function(e){
		e.preventDefault();
		$('.suspended-cart').removeClass('open');
		$('body').removeClass('no-scroll');
	}).on('click', '.item-delete', function(){
		let sku = $(this).parents('.item').data('sku');
		cartRemoveProduct(sku);
	}).on('click', '.item-delete-kit', function(){
		let id = $(this).parents('.item').data('kitid');

		if(confirm('Confirma a remoção deste Kit completo?'))
			cartRemoveKit(id);
	});

	$('#geral').on('click', 'header .shopcart.suspended', function(e){
		e.preventDefault();
		openSuspendedCart();
	});
    
    try{
        var totalItensCarrinhoLoaded = false;
        totalItensCarrinho.registerListener(function(){
            totalItensCarrinhoLoaded = true;
            loadSuspendedCart();
            wbCacheDelete('pages-home');
        });
        
        readListener('totalItensCarrinho', function(){
            if(!totalItensCarrinhoLoaded){
                loadSuspendedCart();
                wbCacheDelete('pages-home');
            }
        });
    }catch (e){
        //console.log(e);
    }

	if($('#geral .suspended-cart').length){
        try{
            var onAddProductCartLoaded = false;
            onAddProductCart.registerListener(function(){
                onAddProductCartLoaded = true;
                openSuspendedCart();
            });

            readListener('onAddProductCart', function(){
                if(!onAddProductCartLoaded)
                    openSuspendedCart();
            });
        }catch (e){
            //console.log(e);
        }
	}
	//
	
	$('form').each(function(){
		$(this).validate();
	});
	
	if(typeof autoComplete === 'function')
		autoComplete('.search [name=q]');
	
	$('#geral').on('click', '.b_olhar', function(e){
		e.preventDefault();
		let pid = $(this).data('pid');
		let sku = $(this).data('sku') || '';
		openMyModal(`inc.php?meio=modulos/produtos/detalhes_look&pid=${pid}&sku=${sku}`, texto_janela_modal, 1180, true, true);
	});
	
	$('#geral').on('click', '[data-loadpage]', function(e){
		e.preventDefault();
		let _th = $(this);
		let data = _th.data();
		if(data['placeholder'])
			_th.html(data['placeholder']);
		
		loadingPresent('');
		$(data['loadto']).load('inc.php?meio='+data['loadpage'], function(){
			loadingRemove();
		});
	});
	
	$('#geral').on('click', '.b_cart', function(e){
		e.preventDefault();
		let sku = $(this).data('sku');
		$.post('shop_func.php', {funcao:'adicionar_produto', sku:sku, direciona:1}, function(d){
			setLayerProducts(d.itens.produtos);
			$('#response').html(d);
		});
	});
	
	if(typeof mCustomScrollbar === 'function'){
		$('.links .drop').mCustomScrollbar({
			theme: 'minimal-dark',
		});
	}
	
	$('header .shopcart:not(.suspended)').on('click', '.cart:not(.zero)', function(){
		location.href = 'carrinho/';
	});
	
	$('body').on('click', '#b-desconectar, .b-desconectar', function(e){
		e.preventDefault();
		loadingPresent('Saindo...');
		$.post('sair.php', function(d){
			loadingRemove();
			wbCacheDelete('pages-home');
			$('#response').html(d);
		});
	});
	
	if(typeof returnBoxquery === 'function'){
		returnBoxquery(function(dados){
			let url = $(dados.texto).data('link');
			location.href = domain + '/' + url;
		});
	}
	
	slider.owlCarousel({
		items: slide_quantidade,
		autoplay: true,
		autoplayTimeout: 5000,
		//autoHeight: true,
		loop: true,
		nav: false,
		navText: ["<i class=\"fa fa-chevron-left\"></i>", "<i class=\"fa fa-chevron-right\"></i>"],
		animateOut: 'bounceOutLeft',
		animateIn: 'bounceInRight',
		responsive: {
			0: {
				items: 1,
			},
			598: {
				items: 1,
			},
			800: {
				items: 1,
			},
			1024:{
				items: slide_quantidade,
			}
			
		}
	});
	
	$('#slider .owl-item').mouseenter(function(){
		slider.trigger('stop.owl.autoplay');
	});
	
	$('#slider .owl-item').mouseleave(function(){
		slider.trigger('play.owl.autoplay', [5000]);
	});
	
	slider.on('translated.owl.carousel', function(){
		$('.lazy').lazy({
			effect: "fadeIn",
			effectTime: 500,
		});
	});
	
	$(window).on('load ', function(){
		slider.owlCarousel({
			autoHeight: true
		});
	});
	
	if(!allow_context_img){
		$(document).on('contextmenu', 'img', function(){ 
		  return false;
		}).on('dragstart', 'img', function(e) { e.preventDefault(); });
	}
	
	$('.lazy').lazy({
		effect: "fadeIn",
		effectTime: 500,
	});
	
	if(windowW >= 800){
		$('#geral').on('mouseover', '.produtos .item', function(){
			let fotosH = $('.fotos', this).height();
			let botoesH = $('.botoes', this).outerHeight(true);
			$('.botoes', this).css({'top': (fotosH - botoesH)});
		}).on('mouseout', '.produtos .item', function(){
			$('.botoes', this).css({'top': '200px'});
		});
	}
	
	initCountDown();
	setMaskCNPJ('.cnpj');
	setMaskDocumentos('.cpf_cnpj');

	$('body').on('click', '.mobile-filtro .ordenar-por', function(e){
		e.preventDefault();

		let _th = $(this);
		_th.next('.drop-filtro').toggleClass('open');
	});

	$('body').on('click', '.mobile-filtro .filtrar-por', function(e){
		e.preventDefault();
		$('.mobile-filtro-suspended').addClass('open');
		$('.mobile-filtro .ordenar-por').next('.drop-filtro').removeClass('open');
	});

	$('body').on('click', '.mobile-filtro-suspended .cover-filtro, .mobile-filtro-suspended .fechar', function(){
		$('.mobile-filtro-suspended').removeClass('open');
	});

	// alert para selecionar cor e tamanho
	$('html').on('click', '.botoes .bt-comprar.blocked', function(){
		let text = $(this).data('alerta');
		swal({
			title: text,
			//text: text,
			type: 'warning',
			confirmButtonText: customAlerts['variacao_botao'] || 'Vou selecionar',
			confirmButtonClass: 'btn-warning',
		});
	});
	
	//anuncios marketplace
	$('html').on('click', '.bt-marketplace-anuncios', function(e){
		e.preventDefault();
		const data = $(this).data();
		const params = new URLSearchParams(document.location.search);
		const sku = params.get("sku");
		const skuParam = sku ? '&sku='+sku : '';

		openMyModal('inc.php?meio=modulos/produtos/detalhes_marketplace_anuncios&gtin=' + data.gtin + skuParam, 'Ofertas para esse produto', 1000);
	});
	
	//
	$('html').on('click', '.bt-central-excluir-perfil', function(e){
		e.preventDefault();
		let id = $(this).data('id');
		if(confirm('Confirma a remoção desta entrada?')){
			$.post('modulos/central/central_perfis_func.php', {funcao:'ff7ad8f543ddd0d436ee831e4417c2f5', id:id}, function(d){
				openResponse('#response', d);
			});
		}
	});

	$('html').on('click', '.bt-central-editar-perfil', function(e){
		e.preventDefault();
		let _th = $(this);
		let id = _th.data('id');
		let width = _th.data('width') || 400;
		let title = _th.data('title') || 'Editar';

		openMyModal(`inc.php?meio=modulos/central/central_perfis_edit&id=${id}`, title, width);
	});
	
	$('html').on('click', '.bt-lista-presentes', function(e){
		e.preventDefault();
		let _th = $(this);
		let sku = _th.data('sku');
		
		openMyModal('inc.php?meio=modulos/central/central_presentes_produtos_confirm&sku='+sku, 'Adicionar à lista de presentes', 400);
	});
});

function openSuspendedCart(){
	$('.suspended-cart').addClass('open active');
	$('body').addClass('no-scroll');
}

function loadSuspendedCart(){
    loadSuspendedCartHome();
}

function loadSuspendedCartHome(){
    let content = $('.suspended-cart .content').length > 0 ? $('.suspended-cart .content') : $('.suspended-cart .drop');
    if(content.length > 0){
        $.post('load-twig.php', {folder:'includes', file:'suspended-cart.html'}, function(d){
            $(content).html(d);
        });
    }else{
        $.post('action.php', {funcao:'cart-number'}, function(d){
            $('header .cart .sup, .cart-header-total-items').html(d.total_items);
            $('header .cart-amount, .cart-header-total-amount').html('R$'+number_format(d.total_value, 2, ',', '.'));
        }, 'json');
    }
}

$(productDetailSKU());

function loadProductBoxDynamic(el){
	let _th = $(el);
	let id = _th.data('id');
	let sku = _th.data('sku');

	if(!id || $('.options', _th).length >= 1) return;

	_th.addClass('w-options');
	_th.attr('data-options', true);
	_th.append(`<div class="options"><span class="loading">Carregando opções...</span></div>`);

	$.post('loadscript/?meio=modulos/produtos/box_sku', {id:id, sku:sku}, function(d){
		$('.options', _th).html(d);
		productBoxDynamic($('.options', _th));
	});
}

function productBoxDynamic(th){

	let content = $('.content', th);

	let id = th.parents('.item').data('id');
	let promodate = content.data('promodate');
	let campos_adicionais = [];
	let campos_adicionais_opcoes;
	try{
		campos_adicionais_opcoes = JSON.parse(atob(content.data('camposadicionais')));
	}catch(err){
		campos_adicionais_opcoes = {};
	}
	let campos_adicionais_qtd = campos_adicionais_opcoes.qtd;
	campos_adicionais_qtd = parseInt(campos_adicionais_qtd) || 1;

	$(content)
	.on('click', '.estoque .cores .cor_primaria:not(.active), .estoque .variacoes .item:not(.active)', function(){
		let sku = $(this).data('sku');
		
		$('.cover-shop', th).addClass('open');
		th.load(`loadscript/?meio=modulos/produtos/box_sku&id=${id}&sku=${sku}&hasClick=1`, function(){
			productBoxDynamic(th);
			$('.cover-shop', th).removeClass('open');
		});
	})
	.on('change', '.estoque .cores [name=seletor], .estoque .variacoes [name=seletor]', function(){
		let sku = $('option:selected', this).data('sku');

		$('.cover-shop', th).addClass('open');
		th.load(`loadscript/?meio=modulos/produtos/box_sku&id=${id}&sku=${sku}&hasClick=1`, function(){
			productBoxDynamic(th);
			$('.cover-shop', th).removeClass('open');
		});
	})
	.on('click', '.estoque .campos_adicionais .item', function(){
		let _th = $(this);
		let valor = _th.data('valor');

		if(campos_adicionais_qtd == 1){
			_th.closest('.campos_adicionais').find('.item').removeClass('active');
			_th.addClass('active');
			campos_adicionais = [];
			campos_adicionais.push(valor);
		}else{
			if(_th.hasClass('active')){
				_th.removeClass('active');
				campos_adicionais.splice(campos_adicionais.indexOf(valor), 1);
			}else{
				if(campos_adicionais.length < campos_adicionais_qtd){
					_th.addClass('active');
					campos_adicionais.push(valor);
				}
			}
		}
		
		content.attr('data-camposadicionaisvalor', campos_adicionais);
	});

	if(windowW > 768){
		$(th).on('mouseenter', function(){
			$(this).removeClass('open');
		});
	}

	$('.popover').remove();
	$('.pop').popover({
		trigger: 'hover',
		html: true,
		sanitize: false,
		delay: {"show": 200},
		content: function(){
			return $(this).html();
		}
	});

	if(promodate){
		$('.countdown:not(.init)').countdown(`${promodate}  23:59:59`, function(event) {
			let pretext = 'Termina em';
			let postext = '';
			$('.counter', this).text(
				event.strftime(`${pretext} ${event.strftime(`%D`) != '00' ? '%Dd' : ''} %Hh %Mm %Ss ${postext}`)
			);
		}).on('finish.countdown', function(e){
			console.log(e);
			//top.document.location.href = document.location.href;
		});
	}

	setInputActions(th);
}

function separa(str, pre = '', pos = ''){
	return str != '' ? pre + str + pos : '';
}

function productDetailSKU(){
	if($('#produto-sku').length == 0) return;
	
	$('#produto-sku').ready(function(){
		let _th = $('#produto-sku');
		let sku = _th.data('sku');
		let widget = _th.data('widget');
		let loadingwhenchange = _th.data('loadingwhenchange');
		
		if(typeof(campos_adicionais) == 'undefined')
			campos_adicionais = '';

		if(typeof(grade_tipo) == 'undefined')
			grade_tipo = 'sku';
		
		let campo_adicional_ok = campos_adicionais ? false : true;
		let campo_adicional = [];
		let campo_adicional_qtd = parseInt(campos_adicionais.qtd) || 1;
		let texto_opcoes_campo_adicional = campo_adicional_qtd > 1 ? campo_adicional_qtd + ' opções' : 'uma opção';

		setInputActions();

		$('.popover').remove();
		$('.pop').popover({
			trigger: 'hover',
			html: true,
			sanitize: false,
			delay: {"show": 200},
			content: function(){
				return $(this).html();
			}
		});

		$('.campos_adicionais .item', _th).on('click', function(){
			let _this = $(this);
			let valor = _this.data('valor');

			if(campo_adicional_qtd == 1){
				_this.closest('.campos_adicionais').find('.item').removeClass('active');
				_this.addClass('active');
				campo_adicional = [];
				campo_adicional.push(valor);
			}else{
				if(_this.hasClass('active')){
					_this.removeClass('active');
					campo_adicional.splice(campo_adicional.indexOf(valor), 1);
				}else{
					if(campo_adicional.length < campo_adicional_qtd){
						_this.addClass('active');
						campo_adicional.push(valor);
					}
				}
			}

			if(campo_adicional.length == campo_adicional_qtd){
				campo_adicional_ok = true;
			}else{
				campo_adicional_ok = false;
			}
		});

		if(grade_tipo == 'sku'){
			$('.variacoes .list .item, .cores .list .item .cor_primaria').click(function(){
				let _this = $(this);
				let sku = _this.data('sku');
				let produtoid = '';
				let type = '';
				let type_value = '';
				
				if(_this.parents('.variacoes:first').length > 0){
					type = 'variacao';
					type_value = _this.data('id');
					produtoid = _this.parents('.variacoes:first').data('produtoid');
				}else if(_this.parents('.cores:first').length > 0){
					type = 'cor';
					type_value = _this.data('cor');
					produtoid = _this.parents('.cores:first').data('produtoid');
					mobileLoadPhotosByColor(type_value);
				}
				
				if(loadingwhenchange)
					_th.append(`<div class="cover-shop"><p>Selecionando...</p></div>`);
				
				$.post('load-widget.php', {'widget':'widgets/' + widget, 'sku':sku, 'checkType': {'type':type, 'type_value': type_value, 'id':produtoid}}, function(d){
					_th.parent('div').html(d);
					initCountDown();
					productDetailSKU($);
					history.pushState({sku: sku}, '', url_relative + sku);
				});
			}).each(function(){
				let _this = $(this);
				
				if(_this.hasClass('active')){
					if(_this.data('cornome') && cor_nome != _this.data('cornome')) {
						cor_nome = _this.data('cornome');
						cor = _this.data('cor');
					}else{
						variacao_nome = _this.text();
					}
					
					if(mostra_variacoes_titulo)
						$('.nome_produto').html(`${nome_produto + separa(cor_nome, ' - ') + separa(variacao_nome, ' - ')}`);
				}
				
			});

			$('.variacoes [name=seletor], .cores [name=seletor]').change(function(){
				let _this = $(this);
				let _data = $('option:selected', _this).data();
				let sku = _data.sku;
				let produtoid = '';
				let type = '';
				let type_value = '';

				if(_this.parents('.variacoes:first').length > 0){
					type = 'variacao';
					type_value = _this.val();
					produtoid = _this.parents('.variacoes:first').data('produtoid');
				}else if(_this.parents('.cores:first').length > 0){
					type = 'cor';
					type_value = _this.val();
					produtoid = _this.parents('.cores:first').data('produtoid');
					mobileLoadPhotosByColor(type_value);
				}

				if(loadingwhenchange)
					_th.append(`<div class="cover-shop"><p>Selecionando...</p></div>`);

				$.post('load-widget.php', {'widget':'widgets/' + widget, 'sku':sku, 'checkType': {'type':type, 'type_value': type_value, 'id':produtoid}}, function(d){
					_th.parent('div').html(d);
					initCountDown();
					productDetailSKU($);
					history.pushState({sku: sku}, '', url_relative + sku);
				});
			});
	
			$('.bt-comprar:not(.no-click):not(.bt-combo)', _th).unbind('click').bind('click', function(e){
				e.preventDefault();
	
				let _this = $(this);
				let parent = _this.parents('#produto');
				let html = _this.html();
				let quantidade = $('input.quantidade').val() || $(this).data('min') || 1;
				let campo_anotacao;
	
				if(!campo_adicional_ok){
					swal({
						title: customAlerts['adicional_titulo'] || 'Ops!',
						text: (customAlerts['adicional_texto'] || 'Por favor selecione')+' '+texto_opcoes_campo_adicional+' de ' + campos_adicionais.title,
						type: 'info',
						confirmButtonText: customAlerts['adicional_botao'] || 'Tudo bem',
						confirmButtonClass: "btn-info",
					});
					return false;
				}

				if(require_campo_anotacao){
					campo_anotacao = $('.campo_anotacao', parent).val();
					if(campo_anotacao == '' && !var_optional_product_annotation){
						swal({
							title: customAlerts['custom_titulo'] || 'Ops!',
							text: (customAlerts['custom_texto'] || '')+' '+$('.campo_anotacao', parent).data('title'),
							type: 'error',
							confirmButtonText: customAlerts['custom_botao'] || 'Vou informar',
							confirmButtonClass: "btn-danger",
						}, function(){
							setTimeout(function(){
								$('.campo_anotacao', parent).focus();
							}, 200);
						});
						return false;
					}
				}
	
				_this.html('adicionando...');
				$.post('shop_func.php', {
					funcao:'adicionar_produto',
					sku: sku,
					quantidade: quantidade,
					campo_adicional: campo_adicional,
					campo_anotacao: campo_anotacao
				}, function(d){
					$('.botoes .bt-go-carrinho').remove();
	
					if(d.code != '010'){
						openResponse('#response', d.message);
						_this.html(html);
						return false;
					}
	
					_this.addClass('ok').html(d.message);
					setTimeout(function(){
						_this.removeClass('ok').html(html);
					}, 1000);

					setLayerProducts(d.itens.produtos);

					totalItensCarrinho.a = d.itens.total_items;
					onAddProductCart.a = true;

                    putListener('totalItensCarrinho', d.itens.total_items);
                    putListener('cacheListener', true);
                    putListener('onAddProductCart', true);
					
					if(redireciona_ao_carrinho){
						setTimeout(function(){
							document.location.href = 'carrinho/';
						}, 500);
					}else{
						$('<a href="carrinho/" class="bt bt-yellow bt-large block bt-go-carrinho mt-3 mb-0" style=\"margin-bottom:10px;\">'+textoBotaoIrParaCarrinho+'</a>').insertAfter($(_this));
					}
					
				}, 'json');
				
			});
	
			$('.bt-comprar.bt-combo', _th).unbind('click').bind('click', function(e) {
				e.preventDefault();
				let _this = $(this);
				let parent = _this.parents('#produto');
				let campo_anotacao = '';
				let variacao = encodeURIComponent($('#produto .variacoes .list .item.active').text());
				let cor = encodeURIComponent($('#produto .cores .list .cor_primaria.active').parent().data('original-title'));
				let cor_id = $('#produto .cores .list .cor_primaria.active').data('cor') || $('#produto .cores select option:selected').val();

				if(!campo_adicional_ok){
					swal({
						title: customAlerts['adicional_titulo'] || 'Ops!',
						text: (customAlerts['adicional_texto'] || 'Por favor selecione')+' '+texto_opcoes_campo_adicional+' de: ' + campos_adicionais.title,
						type: 'info',
						confirmButtonText: customAlerts['adicional_botao'] || 'Tudo bem',
						confirmButtonClass: "btn-info",
					});
					return false;
				}

				if(require_campo_anotacao){
					campo_anotacao = $('.campo_anotacao').val();
					if(campo_anotacao == '' && !var_optional_product_annotation){
						swal({
							title: customAlerts['custom_titulo'] || 'Ops!',
							text: (customAlerts['custom_texto'] || '')+' '+$('.campo_anotacao', parent).data('title'),
							type: 'error',
							confirmButtonText: customAlerts['custom_botao'] || 'Vou informar',
							confirmButtonClass: "btn-danger",
						}, function(){
							setTimeout(function(){
								$('.campo_anotacao').focus();
							}, 200);
						});
						return false;
					}
				}
				
				openMyModal('inc.php?meio=modulos/produtos/detalhes_combo&pid='+produto_id+'&sku='+sku+'&combo='+produto_combo.id+'&valor='+produto_valor+'&variacao='+variacao+'&cor='+cor+'&cor_id='+cor_id+'&anotacao='+campo_anotacao+'&campo_adicional='+campo_adicional, 'Carregando...', 1180);
			});
		
		}else if(grade_tipo == 'grid'){
			
			$('.bt-comprar', _th).click(function(e){
				e.preventDefault();

				let post = false;
				let itens = [];
				let _this = $(this);
				let botao = _this;
				let parent = _this.parents('#produto');

				$('.grade .l .vars .it input').each(function() {
					let _th = $(this);
					let minimo = _th.attr('min');
					let maximo = _th.attr('max');
					let sku = _th.data('sku');
					let valor = _th.val();

					if(parseInt(valor) < parseInt(minimo) && parseInt(minimo) > 1){
						_th.val(minimo).focus();
						openResponse('#response', 'A quantidade mínima para compra deste produto é de '+minimo+' unidades.');
						post = false;
						return false;
					}

					if(parseInt(valor) > parseInt(maximo)){
						_th.val(maximo).focus();
						openResponse('#response', 'Temos '+maximo+' unidades deste produto em estoque!');
						post = false;
						return false;
					}

					itens.push({
						sku:sku,
						qtd:valor
					});

					post = true;
				});

				let campo_anotacao = '';
				if(require_campo_anotacao){
					campo_anotacao = $('.campo_anotacao', parent).val();
					if(campo_anotacao == '' && !var_optional_product_annotation){
						swal({
							title: customAlerts['custom_titulo'] || 'Ops!',
							text: (customAlerts['custom_texto'] || '')+' '+$('.campo_anotacao', parent).data('title'),
							type: 'error',
							confirmButtonText: customAlerts['custom_botao'] || 'Vou informar',
							confirmButtonClass: "btn-danger",
						}, function(){
							setTimeout(function(){
								$('.campo_anotacao', parent).focus();
							}, 200);
						});
						return false;
					}
				}

				if(post){
					botao.html('adicionando...');
					itens = JSON.stringify(itens);
					$.post('shop_func.php', {funcao:'adicionar_produto_grade', produtos:itens, campo_anotacao: campo_anotacao}, function(d){
						$('header .shopcart').load('inc.php?meio=shop_inc');
						$('#response').html(d);
					});
				}
			});
			
		}else if(grade_tipo == 'glasses'){

			$('.bt-comprar, _th').unbind('click').bind('click', function(e){
				e.preventDefault();
				let _this = $(this);

				if(!campo_adicional_ok){
					swal({
						title: customAlerts['adicional_titulo'] || 'Ops!',
						text: (customAlerts['adicional_texto'] || 'Por favor selecione')+' '+texto_opcoes_campo_adicional+' de: ' + campos_adicionais.title,
						type: 'info',
						confirmButtonText: customAlerts['adicional_botao'] || 'Tudo bem',
						confirmButtonClass: "btn-info",
					});
					return false;
				}

				let oe = $('.lente-oe');
				let od = $('.lente-od');

				if(oe.val() == ''){
					swal({
						title: 'Qual grau esférico do olho esquerdo?',
						type: 'info',
						confirmButtonText: 'Vou selecionar',
						confirmButtonClass: 'btn-info btn-sm mt-3',
					}, function(){
						setTimeout(function(){
							oe.focus();
						}, 300);
					});
					return false;
				}

				if(od.val() == ''){
					swal({
						title: 'Qual grau esférico do olho direito?',
						type: 'info',
						confirmButtonText: 'Vou selecionar',
						confirmButtonClass: 'btn-info btn-sm mt-3',
					}, function(){
						setTimeout(function(){
							od.focus();
						}, 300);
					});
					return false;
				}

				compra = {
					'oe': oe.val(),
					'od': od.val(),
				};

				_this.html('adicionando...');
				$.post('shop_func.php', {funcao:'adicionar_produto_lentes', sku: sku, compra: compra, campo_adicional: campo_adicional}, function(d){
					$('#response').html(d);
				});
			});
			
		}else if(grade_tipo == 'ring'){

			$('.box_aneis .box .aros span', _th).click(function(){
				let _this = $(this);
				let tipo = _this.parents('.box').data('tipo');

				_this.parents('.aros').find('span').removeClass('active');
				_this.addClass('active');
			});

			$('#produto .botoes .bt-comprar').unbind('click').bind('click', function(e){
				e.preventDefault();
				let _this = $(this);

				if(!campo_adicional_ok){
					swal({
						title: customAlerts['adicional_titulo'] || 'Ops',
						text: (customAlerts['adicional_texto'] || 'Por favor selecione')+' '+texto_opcoes_campo_adicional+' de: ' + campos_adicionais.title,
						type: 'info',
						confirmButtonText: customAlerts['adicional_botao'] || 'Tudo bem',
					});
					return false;
				}

				var aro_feminino = $('.box_aneis .box[data-tipo=feminino] .aros span.active', _th);
				var aro_masculino = $('.box_aneis .box[data-tipo=masculino] .aros span.active', _th);
				var gravacao_feminino = $('input[name=gravacao_feminino]', _th);
				var gravacao_masculino = $('input[name=gravacao_masculino]', _th);

				if(aro_feminino.length == 0){
					swal({
						title: 'Qual o tamanho de '+texto_aneis.aro1+'?',
						type: 'info',
						confirmButtonText: 'Vou selecionar',
						confirmButtonClass: 'btn-info btn-sm mt-3',
					});
					return false;
				}

				if(aro_masculino.length == 0){
					swal({
						title: 'Qual o tamanho de '+texto_aneis.aro2+'?',
						type: 'info',
						confirmButtonText: 'Vou selecionar',
						confirmButtonClass: 'btn-info btn-sm mt-3',
					});
					return false;
				}

				if(gravacao_feminino.length == 1){
					if(gravacao_feminino.val() == ''){
						swal({
							title: 'Qual a gravação desejada para '+texto_aneis.aro1+'?',
							type: 'info',
							confirmButtonText: 'Vou informar',
							confirmButtonClass: 'btn-info btn-sm mt-3',
						}, function(){
							setTimeout(function(){
								gravacao_feminino.focus();
							}, 300);
						});
						return false;
					}
				}

				if(gravacao_masculino.length == 1){
					if(gravacao_masculino.val() == ''){
						swal({
							title: 'Qual a gravação desejada para '+texto_aneis.aro2+'?',
							type: 'info',
							confirmButtonText: 'Vou informar',
							confirmButtonClass: 'btn-info btn-sm mt-3',
						}, function(){
							setTimeout(function(){
								gravacao_masculino.focus();
							}, 300);
						});
						return false;
					}
				}

				compra = {
					'feminino': {
						'aro': aro_feminino.data('aro'),
						'gravacao': gravacao_feminino.val(),
					},
					'masculino': {
						'aro': aro_masculino.data('aro'),
						'gravacao': gravacao_masculino.val(),
					},
				};

				_this.html('adicionando...');
				$.post('shop_func.php', {funcao:'adicionar_produto_aneis', sku: sku, compra: compra, campo_adicional: campo_adicional}, function(d){
					$('#response').html(d);
				});
			});

		}
	});
}

function initCountDown(){
	$('[data-countdown]:not(.init)').each(function(){
		try{
			let pretext = $(this).data('pretext') || 'Termina em';
			let postext = $(this).data('postext') || 'neste preço';
			let $this = $(this), finalDate = $(this).data('countdown');
			
			$this.countdown(finalDate, function(event){
				$this.html(event.strftime(`<span>${pretext} ${event.strftime(`%D`) != '00' ? '%Dd' : ''} %Hh %Mm %Ss ${postext}</span>`));
			}).on('finish.countdown', function(){
				let callback = $(this).data('callback');
				if(typeof window[callback] == 'function')
					window[callback]();
			});
			$this.addClass('init');
		}catch(e){
			console.log(e);
		}
	});
}

function findComponent(){
	$('body').find('component').each(function(){
		var _th = $(this);
		var _shimmer = _th.data('shimmer');
		
		if(_shimmer && _shimmer >= 1){
			for(var i = 0; i < _shimmer; i++){
				_th.append($(`
					<div class="mock-product">
						<span class="photo shine"></span>
						<span class="line2 shine"></span>
						<span class="line1 shine"></span>
						<span class="line2 shine"></span>
						<span class="btt shine"></span>
					</div>
				`));
			}
		}

		$.ajax({
			url: 'load_components.php',
			method: 'POST',
			timeout: 30000,
			data:  _th.data(),
			success: function(d) {
				if(d.length > 1){
					$(`<div class="block">${d}</div>`).insertAfter(_th);
				}
				_th.remove();

				$('img[data-await]').each(function(){
					let _th = $(this);
					_th.attr('src', _th.data('await'));
				});

				initCountDown();
			},
			error: function(){
				_th.remove();
				initCountDown();
			}
		});
		
	});
}

function findWidget(){
	$('body').find('widget').each(function(){
		var _th = $(this);
		var _shimmer = _th.data('shimmer');

		if(_shimmer && _shimmer >= 1){
			for(var i = 0; i < _shimmer; i++){
				_th.append($(`
					<div class="mock-product">
						<span class="photo shine"></span>
						<span class="line2 shine"></span>
						<span class="line1 shine"></span>
						<span class="line2 shine"></span>
						<span class="btt shine"></span>
					</div>
				`));
			}
		}

		$.ajax({
			url: 'load-widgets',
			method: 'POST',
			timeout: 30000,
			data:  _th.data(),
			success: function(d){
				if(d.length > 1)
					$(`<div class="block">${d}</div>`).insertAfter(_th);
				_th.remove();

				$('img[data-await]').each(function(){
					let _th = $(this);
					_th.attr('src', _th.data('await'));
				});

				initCountDown();
			},
			error: function(){
				_th.remove();
				initCountDown();
			}
		});
	});
}

function setCEP(el){
	$(el).mask('99999-999');
}

function openResponse(camada, data){
	camada = camada.replace(/#/, '');
	camada = '#'+camada;
	clearTimeout(interval);
	$(camada).slideUp('fast');
	$(camada).html(data);
	$(camada).slideDown('slow');
	interval = setTimeout(function(){
		$(camada).slideUp('slow');
	}, 5000);
}

function setTelefone(element){
	$(element).focusout(function(){
		var phone, element;
		element = $(this);
		element.unmask();
		phone = element.val().replace(/\D/g, '');
		if(phone.length > 10) {
			element.mask("(99)99999-999?9");
		} else {
			element.mask("(99)9999-9999?9");
		}
	}).trigger('focusout');
}

function number_format(number, decimals, dec_point, thousands_sep){
    var n = number, prec = decimals;
    n = !isFinite(+n) ? 0 : +n;
    prec = !isFinite(+prec) ? 0 : Math.abs(prec);
    var sep = (typeof thousands_sep == "undefined") ? ',' : thousands_sep;
    var dec = (typeof dec_point == "undefined") ? '.' : dec_point;
 
    var s = (prec > 0) ? n.toFixed(prec) : Math.round(n).toFixed(prec); //fix for IE parseFloat(0.55).toFixed(0) = 0;
 
    var abs = Math.abs(n).toFixed(prec);
    var _, i;
 
    if (abs >= 1000) {
        _ = abs.split(/\D/);
        i = _[0].length % 3 || 3;
 
        _[0] = s.slice(0,i + (n < 0)) +
              _[0].slice(i).replace(/(\d{3})/g, sep+'$1');
 
        s = _.join(dec);
    } else {
        s = s.replace('.', dec);
    }
 
    return s;
}

function setCPF(element){
	$(element).focusout(function(){
		var doc, element2;
		element2 = $(this);
		element2.unmask();
		doc = element2.val().replace(/\D/g, '');
		if(doc.length < 14) {
			element2.mask("999.999.999-9?9999");
		} else {
			element2.mask("99.999.999/9999-99");
		}
	}).trigger('focusout');
}

function setPriceFormat(element){
	var el = element || '.vlr';
	$(el).priceFormat({
		clearPrefix: true,
		prefix:''
	});
}

function popUp(URL, largura, altura) {
	var w = largura;
	var h = altura;
	if(screen.width){
	var winl = (screen.width-w)/2;
	var wint = (screen.height-h)/2;
	}else{winl = 0;wint =0;}
	if (winl < 0) winl = 0;
	if (wint < 0) wint = 0;
	var settings = 'height=' + h + ',';
	settings += 'width=' + w + ',';
	settings += 'top=' + wint + ',';
	settings += 'left=' + winl + ',';
	settings += 'toolbar=no,location=no,status=no,scrollbars=yes,resizable=no';
	win = window.open(URL, "pagina",  settings);
	win.window.focus();
}

function setInputActions(el){
	let camada = el ? $('.input-actions', el) : $('.input-actions');
	
	camada.each(function(){
		let _th = $(this);
		let input = _th.parent().find('input');
		let min = parseFloat(input.attr('min')) || 1;
		let multiplo = parseFloat(input.data('multiplo')) || min;
        let atacado = input.data('atacado') == '1';
		
		if(multiplo != 1 && !atacado){
			let min_mult = permite_quantidade_double ? min.toFixed(2) : min;
			let multiplo_val = multiplo < 1 ? min_mult : multiplo;
			input.attr('readonly', true).data('min', multiplo).val(multiplo_val);
		}
	});
	
	camada.on('click', 'span', function(e){
		e.preventDefault();
		
		let _th = $(this);
		let tipo = _th.attr('class');
		let input = _th.parent().prev('input');
		let min = parseFloat(input.attr('min')) || 1;
		let multiplo = parseFloat(input.data('multiplo')) || min;
		let max = parseFloat(input.attr('max')) || 1;
		let value = parseFloat(input.val()) || 0;
		let new_val;
		let addQtd = permite_quantidade_double ? 0.1 : 1;
		let multiploIsFloat = isFloat(multiplo);
		let equivalencia = input.data('equivalencia');
		
		if(multiplo != 1)
			addQtd = multiplo * 1;
		
		if(tipo == 'plus'){
			new_val = parseFloat(value + addQtd);
			if(new_val > max) return;
			if(permite_quantidade_double)
				new_val = new_val.toFixed(2);
			new_val = new_val < min ? (permite_quantidade_double ? min.toFixed(2) : min) : new_val;
			new_val = multiplo != 1 && multiploIsFloat && isFloat(new_val) ? new_val.toFixed(2) : new_val;
			input.val(new_val).trigger('change');
		}else if(tipo == 'minus'){
			new_val = parseFloat(value - addQtd);
			if(value <= new_val) return;
			if(permite_quantidade_double || isFloat(multiplo))
				new_val = new_val.toFixed(2);
			new_val = new_val < min ? 0 : new_val;
			input.val(new_val).trigger('change');
		}
		
		if(equivalencia) {
			let qtd = (equivalencia * new_val)/multiplo;
			let minAtacado = input.data('min-atacado');
			let valor;
			
			if (new_val >= minAtacado) {
				valor = new_val * (!var_inverte_valores && !isAtacadista ? produto_valor_atacado : produto_valor);
			} else {
				valor = new_val * (!var_inverte_valores ? produto_valor : produto_valor_atacado);
			}

			$('#inc_sku .botoes .equivalencia .msg .valor').text(number_format(parseFloat(valor), 2, ',', '.'));
			$('#inc_sku .botoes .equivalencia .msg .qtd').text(parseFloat(qtd));
		}
	});
}

function isFloat(n){
	return Number(n) === n && n % 1 !== 0;
}

function cartRemoveProduct(sku, callback){
	loadingPresent('Removendo...');
	$.post('shop_func.php', {funcao:'remover_produto', sku:sku}, function(d){
		total_itens_carrinho = d.itens.total_items;
		totalItensCarrinho.a = total_itens_carrinho;
        putListener('totalItensCarrinho', total_itens_carrinho);
        putListener('cacheListener', true);
		cartResponseItemRemove(sku, d);
		loadingRemove();
		if(typeof callback == 'function')
			callback(d);
	}, 'json');
}

function cartRemoveKit(kitId, callback){
	$.post('shop_func.php', {funcao:'remover_kit', kit_id:kitId}, function(d){
		total_itens_carrinho = d.itens.total_items;
		totalItensCarrinho.a = total_itens_carrinho;
        putListener('totalItensCarrinho', total_itens_carrinho);
        putListener('cacheListener', true);
		cartResponseItemRemove(kitId, d, 'kit')
		if(typeof callback == 'function')
			callback(d);
	}, 'json');
}

function cartRemoveGift(sku, callback){
	$.post('shop_func.php', {funcao:'remover_brinde', sku:sku}, function(d){
		total_itens_carrinho = d.itens.total_items;
		totalItensCarrinho.a = total_itens_carrinho;
        putListener('totalItensCarrinho', total_itens_carrinho);
        putListener('cacheListener', true);

		if(typeof callback == 'function')
			callback(d);
	}, 'json');
}

function cartAddProduct(sku, quantidade, callback){
	$.post('shop_func.php', {funcao:'adicionar_produto', sku:sku, quantidade:quantidade}, function(d){
		setLayerProducts(d.itens.produtos);
		totalItensCarrinho.a = d.itens.total_items;
		onAddProductCart.a = true;
        putListener('totalItensCarrinho', d.itens.total_items);
        putListener('cacheListener', true);
        putListener('onAddProductCart', true);

		if(typeof callback == 'function')
			callback(d);
	}, 'json');
}

function cartResponseItemRemove(identificador, d, tipo = 'sku'){
	if($('#carrinho').length > 0 || $('.suspended-cart .drop-list').length > 0){
		let _parents = tipo == 'kit' ? $('#carrinho .item[data-kitid="'+identificador+'"]') : $('#carrinho .item[data-sku="'+identificador+'"]');
		let valor_subtotal = $('#carrinho').find('.valor_subtotal');
		let valor_total = $('#carrinho').find('.valor_total');
		let valor_desconto = $('#carrinho').find('.valor_desconto');
		let valor_giftpack = $('#carrinho').find('.valor_embalagem');
		let span_count = $('#carrinho .wrapper .cart-products .title .count');
		let valor_frete = $('#carrinho').find('.valor_frete');

		_parents.slideUp(500, function(){
			$(this).remove();

			let produto = d.itens.produto;
			let produto_variant = [];

			if(produto['cor_nome'] != '')
				produto_variant.push(produto['cor_nome']);

			if(produto['variacao_nome'] != '')
				produto_variant.push(produto['variacao_nome']);

			valor_total.html(d.itens.valor_total);
			valor_subtotal.html(d.itens.valor_subtotal);
			valor_desconto.html(d.itens.valor_desconto);
			valor_giftpack.html(d.itens.valor_giftpack);
			valor_frete.html('R$0,00');
			span_count.text(`(${d.itens.total_qtd})`);

			if(parseFloat(d.itens.valores['desconto']) > 0){
				valor_desconto.closest('.item').removeClass('hide');
			}else{
				valor_desconto.closest('.item').addClass('hide');
			}

			$('.shopcart .cart .sup, .cart-header-total-items').text(d.itens.total_qtd);
			$('.shopcart .cart-amount, .cart-header-total-amount').text('R$'+number_format(d.itens.valores.total, 2, ',', '.'));
			
			loadCartAction();
			atualizaParcelamento(d.itens.valores.total, 0,  d.itens.valores.desconto);
			
			if(produto['produto'] != undefined){
				dataLayer.push({'ecommerce':null});
				dataLayer.push({
					'event': 'remove_from_cart',
					'ecommerce': {
						'items': [
							{
								'item_name': produto.produto,
								'item_id': produto.sku,
								'price': produto.valor_unitario,
								'item_variant': produto_variant.join(' - '),
								'quantity': produto.quantidade,
							}
						]
					}
				});
				
				dataLayer.push({
					'event': 'removeFromCart',
					'ecommerce': {
						'currencyCode': 'BRL',
						'remove': {
							'products': [
								{
									'name': produto.produto,
									'id': produto.sku,
									'price': produto.valor_unitario,
									'variant': produto_variant.join(' - '),
									'quantity': produto.quantidade,
								}
							]
						}
					}
				});
			}

			if($('#carrinho .cart:visible .item').length == 0)
				location.href = 'carrinho/';
		});
	}
}

function getStoreSession(name, callback){
	$.post('global.php', {funcao:'getStoreSession', name:name}, function(d){
		if(typeof callback == 'function')
			callback(d);
	});
}

function setStoreSession(name, value, callback){
	$.post('global.php', {funcao:'setStoreSession', name:name, value:value}, function(d){
		if(typeof callback == 'function')
			callback(d);
	});
}

function deleteStoreSession(name, callback){
	$.post('global.php', {funcao:'deleteStoreSession', name:name}, function(d){
		if(typeof callback == 'function')
			callback(d);
	});
}

function separador(array, joiner = ', '){
	let out = [];
	array.forEach(function(v){
		if(v != null && v != '')
			out.push(v);
	});
	return out.join(joiner);
}

function setLayerProducts(products)
{
	let produtosDataLayer = [];
	let produtosDataLayerGA4 = [];
	let produtosSKUs = [];
	let produtosIDs = [];
	let produtosCategorias = [];
	let produtosURLs = [];
	let valorFinal = 0;
	let valorFinalQtd = 0;
	let totalFinal = 0;
	let produtosPin = [];
	let uniq = uniqid('id');
	let uniq2 = uniqid('ig');

	products.forEach(function(v){
		let valorVenda = v['valor']['isPromo'] == '1' ? v['valor']['valor_promo'] : v['valor']['valor'];
		valorVenda = parseFloat(valorVenda);
		let valorVendaQtd = parseFloat(v.qtdProduto) * valorVenda;
		const variant = separador([v.cor_nome, v.variacao_nome], ' - ');
		const category = v.site_category || '';
		const categoryGA4 = v.site_category.split('>');
		produtosDataLayer.push({
			'id': v.sku,
			'name': v.produto,
			'quantity': v.qtdProduto,
			'price': valorVenda,
			variant,
			category,
			'google_business_vertical': 'retail'
		});

		produtosDataLayerGA4.push({
			'item_id': v.sku,
			'item_name': v.produto,
			'quantity': v.qtdProduto,
			'price': valorVenda,
			'currency': 'BRL',
			'item_variant': variant,
			'item_category': categoryGA4[0] || '',
			'item_category2': categoryGA4[1] || '',
			'item_category3': categoryGA4[2] || '',
		});

		produtosPin.push({
			product_name: v.produto,
			product_id: v.sku,
			product_category: htmlDecode(category),
			product_variant: variant,
			product_price: valorVenda,
			product_quantity: v.qtdProduto
		});

		totalFinal += v.qtdProduto;

		produtosSKUs.push(v.sku);
		produtosIDs.push(v.produto_id);
		produtosCategorias.push(htmlDecode(v.site_category));
		produtosURLs.push(v.url_absolute);

		valorFinal += parseFloat(number_format(valorVenda, 2, '.', ''));
		valorFinalQtd += parseFloat(number_format(valorVendaQtd, 2, '.', ''));
	});

	if(typeof gtag === 'function') {
		gtag('event', 'add_to_cart', {
			'currency': 'BRL',
			'value': valorFinalQtd,
			'items': produtosDataLayer,
		});
		
		if(google_aw_conversion_id_cart != ''){
			gtag('event', 'conversion', {
				'send_to': google_aw_conversion_id_cart,
				'value': valorFinalQtd,
				'currency': 'BRL'
			});
		}
	}

	dataLayer.push({'ecommerce':null});
	dataLayer.push({
		'event': 'add_to_cart',
		'currency': 'BRL',
		'value': valorFinalQtd,
		'ecommerce': {
			"items": produtosDataLayerGA4
		}
	});

	dataLayer.push({
		'event': 'addToCart',
		'ecommerce': {
			'currencyCode': 'BRL',
			'add': {
				'products': produtosDataLayer,
			}
		}
	});

	dataLayer.push({
		'event': 'fireRemarketingTag',
		'ecomm_prodid': produtosSKUs,
		'ecomm_pagetype': 'cart',
		'ecomm_totalvalue': valorFinalQtd,
	});

	if(typeof fbq === 'function' && FBAddToCartDetail && FBON){
		if(FBCatalogID != ''){
			let code_fbq = {
				content_name: 'AddToCart',
				content_ids: produtosSKUs,
				content_category: produtosCategorias,
				product_catalog_id: FBCatalogID,
				value: valorFinalQtd,
				currency: 'BRL',
				content_type: 'product'
			};
			printFBQ('AddToCart', code_fbq, uniq);
			$.post('global.php', {funcao:'logger', f:'fbpixel-addtocart', l:aID, m:btoa(JSON.stringify(code_fbq)+' - '+uniq)});
		}else{
			let code_fbq = {
				content_name: 'AddToCart',
				value: valorFinalQtd,
				currency: 'BRL',
			};
			printFBQ('AddToCart', code_fbq, uniq);
			$.post('global.php', {funcao:'logger', f:'fbpixel-addtocart', l:aID, m:btoa(JSON.stringify(code_fbq)+' - '+uniq)});
		}

		if(FBCatalogIDAdd != ''){
			let code_fbq_ig = {
				content_name: 'AddToCart',
				content_ids: produtosIDs,
				content_category: produtosCategorias,
				product_catalog_id: FBCatalogIDAdd,
				value: valorFinalQtd,
				currency: 'BRL',
				content_type: 'product'
			};
			printFBQ('AddToCart', code_fbq_ig, uniq2);
			$.post('global.php', {funcao:'logger', f:'fbpixel-addtocart', l:aID, m:btoa(JSON.stringify(code_fbq_ig)+' - '+uniq2)});
		}
		
		$.post('shop_func.php', {funcao:'fb-addtocart', content_ids:produtosSKUs, content_category:produtosCategorias, value:valorFinalQtd, uniqid:uniq});
	}
	
	if(typeof ttq === 'object' && hasTikTokAds){
		const properties = {
			content_id: produtosSKUs.join(''),
			value: valorFinalQtd,
			quantity: totalFinal,
			currency: 'BRL',
			content_type: 'product'
		};
		const event = 'AddToCart';
		ttq.track(event, properties, {event_id: uniq});
		$.post('shop_func.php', {funcao: 'ttq-track', event, properties, event_id: uniq});
	}
	
	if(typeof pintrk === 'function'){
		pintrk('track', 'addtocart', {
			value: valorFinalQtd,
			order_quantity: totalFinal,
			currency: 'BRL',
			line_items: produtosPin
		});
	}
	
	if(typeof Sizebay === 'object'){
		let products_sizebay = [];
		produtosURLs.forEach(function(url){
			products_sizebay.push({"permalink": url});
		});
		const payload = {
			products: products_sizebay
		}
		window.Sizebay.events.addToCart(payload, sizebaytenant)
	}
}

function uniqid(prefix = "", random = false)
{
	const sec = Date.now() * 1000 + Math.random() * 1000;
	const id = sec.toString(16).replace(/\./g, "").padEnd(14, "0");
	return `${prefix}${id}${random ? `.${Math.trunc(Math.random() * 100000000)}`:""}`;
};

function isOnScreen(elem){
	if(elem.length == 0)
		return;
	
	let $window = jQuery(window);
	let viewport_top = $window.scrollTop();
	let viewport_height = $window.height();
	let viewport_bottom = viewport_top + viewport_height;
	let $elem = jQuery(elem);
	let top = $elem.offset().top;
	let height = $elem.height();
	let bottom = top + height;

	return (top >= viewport_top && top < viewport_bottom) ||
		(bottom > viewport_top && bottom <= viewport_bottom) ||
		(height > viewport_height && top <= viewport_top && bottom >= viewport_bottom);
}

function loadCompraRapida(){
	if(box_compra_rapida){
		$('#geral').find('.produtos .item').each(function(){
			let _th = $(this);
			let grade = $('.produto', _th).data('grade');
			let personalizador = $('.produto', _th).data('personalizador');
			if(grade != '4' && grade != '2' && personalizador == '')
				_th.find('.botoes:first').remove();
		});
		
		// carrega os dados sob demanda
		$(window).on('load scroll', function(){
			let time = 0;
			$('#geral').find('.produtos .item:not([data-options]):not([data-sku=""])').each(function(){
				let _th = $(this);
				let grade = $('.produto', _th).data('grade');
				let personalizador = $('.produto', _th).data('personalizador');
				if(_th.parents('.variacoes:first').length == 0 && (grade != '4' && grade != '2' && personalizador == '')){
					if(isOnScreen(_th)){
						setTimeout(function(){
							_th.trigger('active');
							_th.attr('data-options', 'true');
						}, time);
						time += 500;
					}
				}
			});
		});
		//

		if(!isMobile){
			$('#geral').on('mouseenter active', '.produtos .item:not([data-options]):not([data-sku=""])', function(e){
				const _th = $(this);
				const id = _th.data('id');
				const sku = _th.data('sku');
				const time = e.isTrigger === 3 ? 0 : 100;
				let grade = $('.produto', _th).data('grade');
				let personalizador = $('.produto', _th).data('personalizador');

				if(time > 0)
					clearTimeout(timeoutBOX);
				
				if(!id || _th.parents('.variacoes:first').length > 0 || (grade == '4' || grade == '2' || personalizador != '')) return;

				_th.attr('data-options', 'true');
				timeoutBOX = setTimeout(function(){
					$('.botoes', _th).remove();
					_th.append(`<div class="options"><span class="loading"><i class="fa fa fa-refresh fa-spin"></i></span></div>`);

					$.post('loadscript/?meio=modulos/produtos/box_sku', {id:id, sku:sku}, function(d){
						$('.options', _th).html(d);
						productBoxDynamic($('.options', _th));
					});
				}, 100);
			});
		}else{
			$('#geral').find('.produtos .item').each(function(){
				let _th = $(this);
				let grade = $('.produto', _th).data('grade');
				let personalizador = $('.produto', _th).data('personalizador');
				if($('.bt-open-opcoes-mobile', this).length == 0 && (grade != '4' && grade != '2' && personalizador == ''))
					_th.append('<a href="" class="bt-open-opcoes-mobile bt-comprar d-flex d-md-none">'+textoBotaoComprarCR+'</a>');
			});

			$('.bt-open-opcoes-mobile').on('click', function(e){ // , .produtos .item > a
				e.preventDefault();

				let item = $(this).parents('.item:first');

				loadProductBoxDynamic(item);
				$('.options', item).addClass('open');
			});

			$('#geral').on('click', '.bt-close-opcoes-mobile', function(e){
				e.preventDefault();
				let item = $(this).parents('.item:first');
				$('.options', item).removeClass('open');
			});
		}
	}
}

function mobileLoadPhotosByColor(cor_id){
	let slider = $('.mobile-fotos .carrossel', (openInModal ? '#mymodal' : '#geral'));
	let initialSlider = $('.mobile-fotos .carrossel .item.video', (openInModal ? '#mymodal' : '#geral')).length >= 1 && $('.mobile-fotos .carrossel .item:not(.video)', (openInModal ? '#mymodal' : '#geral')).length >= 1 ? 1 : 0;
	
	setTimeout(function(){
		slider.slick('slickUnfilter').slick('slickFilter','[data-cor="'+cor_id+'"], [data-cor=""]');

		// caso não tenham fotos da cor em questão, mostra todas as fotos disponíveis
		if($('.mobile-fotos .carrossel .item[data-cor="'+cor_id+'"]', (openInModal ? '#mymodal' : '#geral')).length == 0)
			slider.slick('slickUnfilter').slick('slickFilter', '.item');

		slider.slick('slickGoTo', initialSlider, true);

		if($(window).width() <= 768 && window['loadedPhotosMobile'] && allowColorScrollMobile){
			setTimeout(function(){
				$('html, body').animate({
					scrollTop: $('section#produto').offset().top - 50
				}, 150);
			}, 500);
		}

		window['loadedPhotosMobile'] = true;
	}, 200);
}

function productLoadPhotosByColor(array){
	let cor_id = array.cor_id;
	let tipo_fotos = array.tipo_fotos;
	
	if(tipo_fotos == '1'){
		setTimeout(function(){
			let slider = $('.fotos .mini, .fotos .big', (openInModal ? '#mymodal' : '#geral'));
			let initialSlider = $('.fotos .mini .item.video', (openInModal ? '#mymodal' : '#geral')).length >= 1 && $('.fotos .mini .item:not(.video)', (openInModal ? '#mymodal' : '#geral')).length >= 1 ? 1 : 0;
			
			slider.slick('slickUnfilter').slick('slickFilter','[data-cor="'+cor_id+'"], [data-cor=""]');

			// caso não tenham fotos da cor em questão, mostra todas as fotos disponíveis
			if($('.fotos .mini .item[data-cor="'+cor_id+'"]', (openInModal ? '#mymodal' : '#geral')).length == 0)
			slider.slick('slickUnfilter').slick('slickFilter', '.item');

			slider.each(function(index,slide){
				let s_id = 0;
				let active_index;

				$(".slick-slide:not(.slick-cloned)",slide).each(function() {
					$(this).attr("data-slick-index",s_id)
					s_id = s_id + 1;
					if(index == 0){
						if($(this).hasClass("slick-current"))
							active_index = s_id;
					}
					if(index == 1){
						if(s_id == active_index){
							$(this).addClass("slick-current");
						}else{
							$(this).removeClass("slick-current");
						}
					}
				});
			});
			
			slider.slick('slickGoTo', initialSlider, true);
			setTimeout(function(){
				slider.slick('slickSetOption', "adaptiveHeight", true, true);
			}, 500);
		}, 100);
	}else if(tipo_fotos == '2'){
		setTimeout(function(){
			let slider = $('.fotos-carousel .carousel', (openInModal ? '#mymodal' : '#geral'));
			slider.slick('slickUnfilter');
			slider.slick('slickFilter','[data-cor="'+cor_id+'"], [data-cor=""]');

			// caso não tenham fotos da cor em questão, mostra todas as fotos disponíveis
			if($('.fotos-carousel .carousel .item[data-cor="'+cor_id+'"]', (openInModal ? '#mymodal' : '#geral')).length == 0){
				slider.slick('slickUnfilter').slick('slickFilter', '.item');
			}
		}, 100);
	}
}

function actionBoxCompraRapida(el){
	let _this = $(el);
	
	let parent = _this.parents('.options');
	let content = parent.children('.content');
	let content_data = content.data();
	let html = _this.html();
	let quantidade = _this.parents('.botoes-acao').find('input.quantidade').val() || 1;
	let campo_anotacao = '';
	let require_campo_anotacao = content_data['campoanotacao'];
    let optionalproductannotation = content_data['optionalproductannotation'];
	let camposadicionais;
	try{
		camposadicionais = JSON.parse(atob(content_data.camposadicionais));
	}catch (err){
		camposadicionais = {};
	}
	let campo_adicional = content.attr('data-camposadicionaisvalor');
	let campo_adicional_qtd = parseInt(camposadicionais.qtd) || 1;
	let campo_adicional_qtd_selected = campo_adicional != '' ? campo_adicional.split(',').length : 0;
	let sku = content_data.sku;
	
	// produto
	if(!_this.hasClass('no-click') && !_this.hasClass('bt-combo')){
		if(camposadicionais.title && campo_adicional_qtd_selected < campo_adicional_qtd){
			let texto_opcoes = campo_adicional_qtd > 1 ? campo_adicional_qtd + ' opções' : 'uma opção';
			parent.addClass('open');
			swal({
				title: customAlerts['adicional_titulo'] || 'Ops!',
				text: (customAlerts['adicional_texto'] || 'Por favor selecione')+' '+texto_opcoes+' de ' + decodeURIComponent((camposadicionais.title)),
				type: 'info',
				confirmButtonText: customAlerts['adicional_botao'] || 'Tudo bem',
				confirmButtonClass: "btn-info",
			});
			return false;
		}

		if(require_campo_anotacao){
			campo_anotacao = $('.campo_anotacao', parent).val();
			if(campo_anotacao == '' && !optionalproductannotation){
				parent.addClass('open');
				swal({
					title: customAlerts['custom_titulo'] || 'Ops!',
					text: (customAlerts['custom_texto'] || '')+' '+content_data.campoanotacao,
					type: 'error',
					confirmButtonText: customAlerts['custom_botao'] || 'Vou informar',
					confirmButtonClass: "btn-danger",
				}, function(){
					setTimeout(function(){
						$('.campo_anotacao', parent).focus();
					}, 200);
				});
				return false;
			}
		}

		_this.html('adicionando...');
		$.post('shop_func.php', {funcao:'adicionar_produto', sku:sku, quantidade: quantidade, campo_adicional: campo_adicional, campo_anotacao: campo_anotacao}, function(d){
			$('.botoes-acao .bt-go-carrinho', parent).remove();

			if(d.code != '010'){
				openResponse('#response', d.message);
				_this.html(html);
				return false;
			}

			setLayerProducts(d.itens.produtos);

			_this.addClass('ok').html(d.message);
			setTimeout(function(){
				_this.removeClass('ok').html(html);
			}, 1000);

			$('.shopcart .cart .sup, .cart-header-total-items').text(d.itens.total_qtd);
			$('.shopcart .cart-amount, .cart-header-total-amount').text('R$'+number_format(d.itens.valores.total, 2, ',', '.'));
			totalItensCarrinho.a = d.itens.total_items;
			onAddProductCart.a = true;
            putListener('totalItensCarrinho', d.itens.total_items);
            putListener('cacheListener', true);
            putListener('onAddProductCart', true);

			$('<a href="./carrinho/" class="bt bt-yellow bt-large block bt-go-carrinho" style="position: absolute; left: 0; top: 100%;">'+textoBotaoIrParaCarrinho+'</a>').appendTo($('.botoes-acao', parent));
		}, 'json');
		
		return; 
	}
	
	// combo
	if(_this.hasClass('bt-combo')){
		let combo = content_data.combo;
		parent.addClass('open');

		if(camposadicionais.title && campo_adicional_qtd_selected < campo_adicional_qtd){
			let texto_opcoes = campo_adicional_qtd > 1 ? campo_adicional_qtd + ' opções' : 'uma opção';
			parent.addClass('open');
			swal({
				title: customAlerts['adicional_titulo'] || 'Ops!',
				text: (customAlerts['adicional_texto'] || 'Por favor selecione')+' '+texto_opcoes+' de ' + decodeURIComponent((camposadicionais.title)),
				type: 'info',
				confirmButtonText: customAlerts['adicional_botao'] || 'Tudo bem',
				confirmButtonClass: "btn-info",
			});
			return false;
		}

		if(require_campo_anotacao){
			campo_anotacao = $('.campo_anotacao', parent).val();
			if(campo_anotacao == '' && !optionalproductannotation){
				parent.addClass('open');
				swal({
					title: customAlerts['custom_titulo'] || 'Ops!',
					text: (customAlerts['custom_texto'] || '')+' '+content_data.campoanotacao,
					type: 'error',
					confirmButtonText: customAlerts['custom_botao'] || 'Vou informar',
					confirmButtonClass: "btn-danger",
				}, function(){
					setTimeout(function(){
						$('.campo_anotacao', parent).focus();
					}, 200);
				});
				return false;
			}
		}		
		
		let variacao_selecionada = encodeURIComponent($('.produtos .item:hover .options .estoque .variacoes .list .item.active').text());
		let cor_selecionada = encodeURIComponent($('.produtos .item:hover .options .estoque .cores .t .small').text());
		let cor_id = $('.produtos .item:hover .options .estoque .cores .list .cor_primaria.active').data('cor') || $('.produtos .item:hover .options .estoque .cores select').find(':selected').val();
		
		openMyModal('inc.php?meio=modulos/produtos/detalhes_combo&pid='+content_data.pid+'&sku='+sku+'&combo='+combo.id+'&valor='+content_data.valor+'&variacao='+variacao_selecionada+'&cor='+cor_selecionada+'&cor_id='+cor_id+'&anotacao='+campo_anotacao+'&campo_adicional='+campo_adicional, 'Carregando...', 1180);
		return;
	}
}

function setVideoYoutubeBG(videoId, elementId){
	if($('head script#apiYT').length == 0)
		$('head').append('<script id="apiYT" src="https://www.youtube.com/player_api">');

	setTimeout(function(){
		window.onYouTubePlayerAPIReady = videoYTReady(videoId, elementId);
	}, 1500);
}

function videoYTReady(videoId, elementId){
	var player_video_home;
	var video_home_player_defaults = {
		autoplay: 1,
		autohide: 1,
		modestbranding: 0,
		rel: 0,
		showinfo: 0,
		controls: 0,
		disablekb: 1,
		enablejsapi: 0,
		iv_load_policy: 3,
	};

	player_video_home = new YT.Player(elementId, {
		loop: 1,
		events: {
			'onReady': function(){
				player_video_home.loadVideoById({
					'videoId': videoId,
					'suggestedQuality': 'hd1080',
				});
				player_video_home.mute();
			},
			'onStateChange': function(e){
				if(e.data === YT.PlayerState.ENDED)
					player_video_home.playVideo();
			}
		},
		playerVars: video_home_player_defaults,
	});
}

function findOptionsFrete(data){
	let tipo_alerta = Number.isInteger(data) ? data : data['tipo_alerta'];
	let hash = data['hash'];
	if(tipo_alerta == '0')
		return;
	
	setTimeout(function(){
		let message = `<h4 class="d-block p-3 border border-danger bg-light rounded text-danger text-center msg-sem-frete">Infelizmente não há opções de frete para este endereço no momento.</h4>`;
	
		if(tipo_alerta == '1'){
			let total = parseInt($('#result_frete .item').length);
			let total_component = parseInt($('#result_frete component').length);
			if(total == 0 && total_component == 0){
				if($('#result_frete .msg-sem-frete').length == 0)
					$('#result_frete').append(message);
			}else{
				$('#result_frete .msg-sem-frete').remove();
			}

			if(total_component == 0)
				freteSortable();
		}else if(tipo_alerta == '2'){
			let total = parseInt($('.result_frete_cart .frete-opcao').length);
			let total_component = parseInt($('.result_frete_cart component').length);
			
			if(total == 0 && total_component == 0){
				if($('.result_frete_cart .msg-sem-frete').length == 0)
					$('.result_frete_cart').append(message);
			}else{
				$('.result_frete_cart .msg-sem-frete').remove();
			}
			
			if(total <= 1){
				$('.result_frete_cart').removeClass('g-2');
			}else{
				$('.result_frete_cart').addClass('g-2');
			}
			
			if(total_component == 0 && typeof pushOptionFrete == 'function')
				pushOptionFrete();

			if(total_component == 0)
				freteSortable();
		}else if(tipo_alerta == '3'){
			let opcoes = $('.result_frete_mktplace[data-hash='+hash+'] .frete-opcao');
			let total = parseInt(opcoes.length);
			let total_component = parseInt($('.result_frete_mktplace[data-hash='+hash+'] component').length);
			if(total == 0 && total_component == 0){
				if($('.result_frete_mktplace[data-hash='+hash+'] .msg-sem-frete').length == 0)
					$('.result_frete_mktplace[data-hash='+hash+']').append(message);
			}else{
				$('.result_frete_mktplace[data-hash='+hash+'] .msg-sem-frete').remove();
			}
			
			if(total_component == 0){
				freteSortable();
				$('.loading-frete[data-hash='+hash+']').remove();
				$(opcoes).removeClass('hide');
			}
		}
	}, 100);
}

function freteSortable()
{
	setTimeout(function(){
		$('.sortable-frete').each(function(){
			let $this = $(this);
			$this.append($this.find('.frete-opcao').get().sort(function(a, b) {
				return $(a).data('index') - $(b).data('index');
			}));
		});

		$('.result_frete_cart, .result_frete_mktplace').find('div.block:not(.frete-opcao)').remove();
		$('.result_frete_cart.lista-inputs').addClass('mt-3');
	}, 0);
}

function printFBQ(event, code, eventID = ''){
	if(typeof fbq === 'function' && FBON){
		if(eventID != ''){
			return fbq('track', event, code, {
				eventID: eventID
			});
		}
		return fbq('track', event, code);
	}
}

function printVGO(email)
{
	if(typeof vgo === 'function')
		return vgo('setEmail', email);
}

function findOwlAuto()
{
	$('#geral').find('.owl-auto').each(function(){
		let _th = $(this);
		let data = _th.data();
		let owlVar = 'varname' in data ? data.varname : (new Date()).getTime();
        
		window[owlVar] = _th.owlCarousel({
			items: data.items || 1,
			autoplay: data.autoplay || false,
			autoplayTimeout: data.autoplaytimeout || 5000,
			autoplayHoverPause: 'autoplayHoverPause' in data ? data.autoplayhoverpause : true,
			autoHeight: data.autoheight || false,
			loop: data.loop || false,
			nav: data.nav || false,
			dots: 'dots' in data ? data.dots : true,
			margin: data.margin || 0,
			navText: ["<i class=\"fa fa-chevron-left\"></i>", "<i class=\"fa fa-chevron-right\"></i>"],
			animateOut: 'bounceOutLeft',
			animateIn: 'bounceInRight',
			responsive: {
				0: {
					items: data.responsive0 || 1,
					margin: data.marginmobile || 5,
				},
				598: {
					items: data.responsive598 || 1,
					margin: data.marginmobile || 5,
				},
				800: {
					items: data.responsive800 || 1,
				},
				1024:{
					items: data.items || 1,
				}
			}
		})
	});
}

var luhnCheck = function(num){
	num = num.replace(/\D/g,"");
	const arr = (num + '')
		.split('')
		.reverse()
		.map(x => parseInt(x));
	const lastDigit = arr.shift();
	let sum = arr.reduce(
		(acc, val, i) => (i % 2 !== 0 ? acc + val : acc + ((val *= 2) > 9 ? val - 9 : val)),
		0
	);
	sum += lastDigit;
	return sum % 10 === 0;
};

function adsBlocked(callback){
	let testURL = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'

	let myInit = {
		method: 'HEAD',
		mode: 'no-cors'
	};

	let myRequest = new Request(testURL, myInit);

	fetch(myRequest).then(function(response){
		return response;
	}).then(function(response){
		callback(false)
	}).catch(function(e){
		callback(true)
	});
}

function htmlDecode(input) {
	let doc = new DOMParser().parseFromString(input, "text/html");
	return doc.documentElement.textContent;
}

function nl2br(str, breakTag = '[br]'){
    if(typeof str === 'undefined' || str === null)
        return '';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

function wbCacheDelete(name, callback){
	if(typeof caches === "object")
		caches.delete('workbox:cross-origin:' + name);
	
	if(typeof callback === 'function')
		callback();
}

function limpaCache(){
	wbCacheDelete('pages-home');
}

