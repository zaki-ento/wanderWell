(function(){
  function initSection(sectionEl) {
    var sectionId = sectionEl.getAttribute('data-section-id');
    if (!sectionId) return;

    var section = document.getElementById('wwRoute-' + sectionId);
    if (!section) return;

    var track = document.getElementById('wwRouteTrack-' + sectionId),
        svg = document.getElementById('wwRouteSvg-' + sectionId),
        maskPath = document.getElementById('wwRouteMaskPath-' + sectionId),
        ghost = document.getElementById('wwRouteGhost-' + sectionId),
        route = document.getElementById('wwRoutePath-' + sectionId),
        pin = document.getElementById('wwRoutePin-' + sectionId),
        stopsG = document.getElementById('wwRouteStops-' + sectionId),
        lines = Array.prototype.slice.call(section.querySelectorAll('.ww-route-line')),
        NS = 'http://www.w3.org/2000/svg';
    var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    var bgGrid = section.querySelector('.ww-route-bg-grid'),
        bgBloom = section.querySelector('.ww-route-bg-bloom'),
        world = document.getElementById('wwWorld-' + sectionId);
    var n = lines.length, L = 0, fracs = [], dots = [], active = -2, lastP = 0;

    // normalized coordinates path reference points
    var NORM = [[0.07,0.03],[0.58,0.11],[0.88,0.23],[0.34,0.33],[0.09,0.47],[0.44,0.57],[0.92,0.70],[0.52,0.85],[0.20,0.97]];

    // Clear any existing stop dots (in case of re-init in editor)
    stopsG.innerHTML = '';

    if (n > 1) {
      for(var i = 0; i < n; i++) {
        fracs.push(0.12 + i * (0.88 - 0.12) / (n - 1));
        var d = document.createElementNS(NS, 'circle');
        d.setAttribute('class', 'ww-route-stop');
        d.setAttribute('r', 6);
        d.setAttribute('fill', 'var(--cream)');
        d.setAttribute('stroke', 'var(--white)');
        d.setAttribute('stroke-width', 3);
        d.setAttribute('opacity', '0.3');
        stopsG.appendChild(d);
        dots.push(d);
      }
    } else if (n === 1) {
      fracs.push(0.5);
      var d = document.createElementNS(NS, 'circle');
      d.setAttribute('class', 'ww-route-stop');
      d.setAttribute('r', 6);
      d.setAttribute('fill', 'var(--cream)');
      d.setAttribute('stroke', 'var(--white)');
      d.setAttribute('stroke-width', 3);
      d.setAttribute('opacity', '0.3');
      stopsG.appendChild(d);
      dots.push(d);
    }

    // function buildPath(w, h) {
    //   var wide = w > 900;
    //   var pts = NORM.map(function(p) {
    //     var x = wide ? (0.04 * w + p[0] * 0.56 * w) : (0.5 * w + (p[0] - 0.5) * 0.64 * w);
    //     return { x: x, y: 0.07 * h + p[1] * 0.82 * h };
    //   });
    //   var d = 'M' + pts[0].x.toFixed(1) + ',' + pts[0].y.toFixed(1);
    //   for(var i = 0; i < pts.length - 1; i++) {
    //     var p0 = pts[i-1] || pts[i], p1 = pts[i], p2 = pts[i+1], p3 = pts[i+2] || pts[i+1];
    //     d += ' C' + (p1.x + (p2.x - p0.x) / 6).toFixed(1) + ',' + (p1.y + (p2.y - p0.y) / 6).toFixed(1)
    //       + ' ' + (p2.x - (p3.x - p1.x) / 6).toFixed(1) + ',' + (p2.y - (p3.y - p1.y) / 6).toFixed(1)
    //       + ' ' + p2.x.toFixed(1) + ',' + p2.y.toFixed(1);
    //   }
    //   return d;
    // }
    function buildPath(w, h) {
  var desktop = w > 980;
  var tablet = w > 700 && w <= 980;

  var pts = NORM.map(function(p) {
    var x;

    // console.log('w: ', w);
    // console.log('desktop: ', desktop);
    // console.log('tablet: ', tablet);
    // console.log('mobile: ', !desktop && !tablet);
    // console.log('==================');

    if (desktop) {
      x = 0.04 * w + p[0] * 0.56 * w;
    } else if (tablet) {
      x = 0.04 * w + p[0] * 0.62 * w;
    } else {
     // x = 0.5 * w + (p[0] - 0.5) * 0.64 * w;

       x = 0.5 * w + (p[0] - 0.5) * 0.64 * w;
    }

    return {
      x: x,
      y: 0.07 * h + p[1] * 0.82 * h
    };
  });

  var d = 'M' + pts[0].x.toFixed(1) + ',' + pts[0].y.toFixed(1);

  for (var i = 0; i < pts.length - 1; i++) {
    var p0 = pts[i - 1] || pts[i];
    var p1 = pts[i];
    var p2 = pts[i + 1];
    var p3 = pts[i + 2] || pts[i + 1];

    d += ' C' +
      (p1.x + (p2.x - p0.x) / 6).toFixed(1) + ',' +
      (p1.y + (p2.y - p0.y) / 6).toFixed(1) + ' ' +
      (p2.x - (p3.x - p1.x) / 6).toFixed(1) + ',' +
      (p2.y - (p3.y - p1.y) / 6).toFixed(1) + ' ' +
      p2.x.toFixed(1) + ',' +
      p2.y.toFixed(1);
  }

  return d;
}

    function currentIdx(p) {
      var idx = -1;
      for(var i = 0; i < n; i++) {
        if(p >= fracs[i] - 0.06) idx = i;
      }
      return idx;
    }

    function paint(idx, p) {
      if(!L) {
        layout();
        if(!L) return;
      }
      //console.log('paint idx:', idx, 'p:', p, 'L:', L);
      maskPath.setAttribute('stroke-dashoffset', L * (1 - p));
      var pt = route.getPointAtLength(Math.max(0.001, p) * L);
      pin.setAttribute('transform', 'translate(' + pt.x + ',' + pt.y + ') scale(1.15)');
      pin.setAttribute('opacity', p > 0.01 ? 1 : 0);
      if (n === 0) return;
      if(idx === active) return;
      active = idx;
      lines.forEach(function(l, i) {
        l.classList.toggle('on', i === idx);
        l.classList.toggle('past', i < idx);
      });
      dots.forEach(function(d, i) {
        var hit = p >= fracs[i] - 0.01;
        d.setAttribute('opacity', hit ? 1 : 0.3);
        d.setAttribute('r', hit ? 8 : 6);
      });
    }

    function layout() {
      var r = svg.getBoundingClientRect(), w = Math.round(r.width), h = Math.round(r.height);
      if(!w || !h) return;
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      var d = buildPath(w, h);
      ghost.setAttribute('d', d);
      route.setAttribute('d', d);
      maskPath.setAttribute('d', d);
      L = route.getTotalLength();
      maskPath.setAttribute('stroke-dasharray', L + ' ' + L);

      var samples = [], SN = 340;
      for(var s = 0; s <= SN; s++) samples.push(route.getPointAtLength(L * s / SN));

      function bandX(y0, y1) {
        var min = Infinity, max = -Infinity;
        for(var k = 0; k < samples.length; k++) {
          var pt = samples[k];
          if(pt.y >= y0 && pt.y <= y1) {
            if(pt.x < min) min = pt.x;
            if(pt.x > max) max = pt.x;
          }
        }
        return (min === Infinity) ? null : { min: min, max: max };
      }

      dots.forEach(function(el, i) {
        var pt = route.getPointAtLength(fracs[i] * L);
        el.setAttribute('cx', pt.x);
        el.setAttribute('cy', pt.y);
        var line = lines[i];
        if(!line) return;
        var pad = 44, gap = 54, minW = 250;
        line.style.width = '';
        var lh = line.offsetHeight || 150;
        var top = Math.max(20, Math.min(h - lh - 20, pt.y - lh / 2));
        var ext = bandX(top - 14, top + lh + 14);
        var rightStart = Math.max(w * 0.6, (ext ? ext.max : w * 0.5) + gap);
        var best = { top: top, side: (w - rightStart - pad) >= minW ? 'right' : 'left', ext: ext };
        line.style.top = Math.round(best.top) + 'px';
        if(best.side === 'right') {
          var lx = rightStart;
          line.style.right = 'auto';
          line.style.left = Math.round(lx) + 'px';
          line.style.width = Math.round(Math.min(560, Math.max(minW, w - lx - pad))) + 'px';
          line.style.textAlign = 'left';
        } else {
          var rx = Math.max(w * 0.32, w - (best.ext ? best.ext.min : w * 0.5) + gap);
          line.style.left = 'auto';
          line.style.right = Math.round(rx) + 'px';
          line.style.width = Math.round(Math.min(560, Math.max(minW, w - rx - pad))) + 'px';
          line.style.textAlign = 'right';
        }
      });
      active = -2;
      paint(currentIdx(lastP), lastP);
    }

    function loadScripts(callback) {
      if (window.d3 && window.topojson) {
        callback();
        return;
      }
      var count = 0;
      function check() {
        count++;
        if (count === 2) callback();
      }
      if (!window.d3) {
        var s1 = document.createElement('script');
        s1.src = 'https://unpkg.com/d3@7.9.0/dist/d3.min.js';
        s1.onload = check;
        document.head.appendChild(s1);
      } else {
        check();
      }
      if (!window.topojson) {
        var s2 = document.createElement('script');
        s2.src = 'https://unpkg.com/topojson-client@3.1.0/dist/topojson-client.min.js';
        s2.onload = check;
        document.head.appendChild(s2);
      } else {
        check();
      }
    }

    function initWorld() {
      if(!world || !window.d3 || !window.topojson) return;
      if(world.querySelector('g')) return;
      
      fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json')
        .then(function(r) { return r.json(); })
        .then(function(topo) {
          var feats = topojson.feature(topo, topo.objects.countries);
          var W = 1400, H = 700;
          world.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
          var proj = d3.geoNaturalEarth1().fitSize([W, H], feats);
          var path = d3.geoPath(proj);
          var g = document.createElementNS(NS, 'g');
          feats.features.forEach(function(f) {
            var d = path(f);
            if(!d) return;
            var p = document.createElementNS(NS, 'path');
            p.setAttribute('d', d);
            g.appendChild(p);
          });
          world.appendChild(g);
        })
        .catch(function(){});
    }

    loadScripts(initWorld);

    var LEAD = 0.55;
    function update() {
      var vh = window.innerHeight,
          top = track.getBoundingClientRect().top,
          lead = vh * LEAD,
          total = track.offsetHeight - vh + lead;
      var p = total > 0 ? Math.min(1, Math.max(0, (-top + lead) / total)) : 0;
    //  console.log('update() -> top:', top, 'lead:', lead, 'total:', total, 'p:', p);
      lastP = p;
      if(bgGrid) bgGrid.style.transform = 'translate3d(0,' + (p * -26).toFixed(1) + 'px,0)';
      if(world) world.style.transform = 'translate3d(' + (p * -38).toFixed(1) + 'px,' + (p * -16).toFixed(1) + 'px,0)';
      if(bgBloom) bgBloom.style.transform = 'translate3d(' + (p * 26).toFixed(1) + 'px,' + (p * 20).toFixed(1) + 'px,0)';
      paint(currentIdx(p), p);
    }

    if(reduce) {
      section.classList.add('no-pin');
      lines.forEach(function(l) { l.classList.add('on'); });
      layout();
      return;
    }

    var ticking = false;
    function onScroll() {
      if(!ticking) {
        ticking = true;
        requestAnimationFrame(function() {
          ticking = false;
          update();
        });
      }
    }
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    
    var rt;
    var onResize = function() {
      clearTimeout(rt);
      rt = setTimeout(function() {
        layout();
        update();
      }, 120);
    };
    window.addEventListener('resize', onResize);

    sectionEl.addEventListener('ww-cleanup', function() {
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onResize);
    });

    layout();
    update();
  }

  function initAll() {
    var sections = document.querySelectorAll('.ww-problem-section');
    sections.forEach(function(sec) {
      if (!sec.classList.contains('ww-problem-initialized')) {
        sec.classList.add('ww-problem-initialized');
        initSection(sec);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initAll);
  if (document.readyState !== 'loading') {
    initAll();
  }

  document.addEventListener('shopify:section:load', function(event) {
    if (event.target.classList.contains('ww-problem-section')) {
      var prevSec = event.target;
      var eventCleanup = new CustomEvent('ww-cleanup');
      prevSec.dispatchEvent(eventCleanup);

      event.target.classList.remove('ww-problem-initialized');
      initAll();
    }
  });
})();
