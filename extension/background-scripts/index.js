"use strict";
(() => {
  // node_modules/browser-image-compression/dist/browser-image-compression.mjs
  function _mergeNamespaces(e3, t3) {
    return t3.forEach((function(t4) {
      t4 && "string" != typeof t4 && !Array.isArray(t4) && Object.keys(t4).forEach((function(r3) {
        if ("default" !== r3 && !(r3 in e3)) {
          var i3 = Object.getOwnPropertyDescriptor(t4, r3);
          Object.defineProperty(e3, r3, i3.get ? i3 : { enumerable: true, get: function() {
            return t4[r3];
          } });
        }
      }));
    })), Object.freeze(e3);
  }
  function copyExifWithoutOrientation(e3, t3) {
    return new Promise((function(r3, i3) {
      let o3;
      return getApp1Segment(e3).then((function(e4) {
        try {
          return o3 = e4, r3(new Blob([t3.slice(0, 2), o3, t3.slice(2)], { type: "image/jpeg" }));
        } catch (e5) {
          return i3(e5);
        }
      }), i3);
    }));
  }
  var getApp1Segment = (e3) => new Promise(((t3, r3) => {
    const i3 = new FileReader();
    i3.addEventListener("load", (({ target: { result: e4 } }) => {
      const i4 = new DataView(e4);
      let o3 = 0;
      if (65496 !== i4.getUint16(o3)) return r3("not a valid JPEG");
      for (o3 += 2; ; ) {
        const a3 = i4.getUint16(o3);
        if (65498 === a3) break;
        const s3 = i4.getUint16(o3 + 2);
        if (65505 === a3 && 1165519206 === i4.getUint32(o3 + 4)) {
          const a4 = o3 + 10;
          let f3;
          switch (i4.getUint16(a4)) {
            case 18761:
              f3 = true;
              break;
            case 19789:
              f3 = false;
              break;
            default:
              return r3("TIFF header contains invalid endian");
          }
          if (42 !== i4.getUint16(a4 + 2, f3)) return r3("TIFF header contains invalid version");
          const l3 = i4.getUint32(a4 + 4, f3), c3 = a4 + l3 + 2 + 12 * i4.getUint16(a4 + l3, f3);
          for (let e5 = a4 + l3 + 2; e5 < c3; e5 += 12) {
            if (274 == i4.getUint16(e5, f3)) {
              if (3 !== i4.getUint16(e5 + 2, f3)) return r3("Orientation data type is invalid");
              if (1 !== i4.getUint32(e5 + 4, f3)) return r3("Orientation data count is invalid");
              i4.setUint16(e5 + 8, 1, f3);
              break;
            }
          }
          return t3(e4.slice(o3, o3 + 2 + s3));
        }
        o3 += 2 + s3;
      }
      return t3(new Blob());
    })), i3.readAsArrayBuffer(e3);
  }));
  var e = {};
  var t = { get exports() {
    return e;
  }, set exports(t3) {
    e = t3;
  } };
  !(function(e3) {
    var r3, i3, UZIP2 = {};
    t.exports = UZIP2, UZIP2.parse = function(e4, t3) {
      for (var r4 = UZIP2.bin.readUshort, i4 = UZIP2.bin.readUint, o3 = 0, a3 = {}, s3 = new Uint8Array(e4), f3 = s3.length - 4; 101010256 != i4(s3, f3); ) f3--;
      o3 = f3;
      o3 += 4;
      var l3 = r4(s3, o3 += 4);
      r4(s3, o3 += 2);
      var c3 = i4(s3, o3 += 2), u2 = i4(s3, o3 += 4);
      o3 += 4, o3 = u2;
      for (var h2 = 0; h2 < l3; h2++) {
        i4(s3, o3), o3 += 4, o3 += 4, o3 += 4, i4(s3, o3 += 4);
        c3 = i4(s3, o3 += 4);
        var d2 = i4(s3, o3 += 4), A = r4(s3, o3 += 4), g2 = r4(s3, o3 + 2), p2 = r4(s3, o3 + 4);
        o3 += 6;
        var m2 = i4(s3, o3 += 8);
        o3 += 4, o3 += A + g2 + p2, UZIP2._readLocal(s3, m2, a3, c3, d2, t3);
      }
      return a3;
    }, UZIP2._readLocal = function(e4, t3, r4, i4, o3, a3) {
      var s3 = UZIP2.bin.readUshort, f3 = UZIP2.bin.readUint;
      f3(e4, t3), s3(e4, t3 += 4), s3(e4, t3 += 2);
      var l3 = s3(e4, t3 += 2);
      f3(e4, t3 += 2), f3(e4, t3 += 4), t3 += 4;
      var c3 = s3(e4, t3 += 8), u2 = s3(e4, t3 += 2);
      t3 += 2;
      var h2 = UZIP2.bin.readUTF8(e4, t3, c3);
      if (t3 += c3, t3 += u2, a3) r4[h2] = { size: o3, csize: i4 };
      else {
        var d2 = new Uint8Array(e4.buffer, t3);
        if (0 == l3) r4[h2] = new Uint8Array(d2.buffer.slice(t3, t3 + i4));
        else {
          if (8 != l3) throw "unknown compression method: " + l3;
          var A = new Uint8Array(o3);
          UZIP2.inflateRaw(d2, A), r4[h2] = A;
        }
      }
    }, UZIP2.inflateRaw = function(e4, t3) {
      return UZIP2.F.inflate(e4, t3);
    }, UZIP2.inflate = function(e4, t3) {
      return e4[0], e4[1], UZIP2.inflateRaw(new Uint8Array(e4.buffer, e4.byteOffset + 2, e4.length - 6), t3);
    }, UZIP2.deflate = function(e4, t3) {
      null == t3 && (t3 = { level: 6 });
      var r4 = 0, i4 = new Uint8Array(50 + Math.floor(1.1 * e4.length));
      i4[r4] = 120, i4[r4 + 1] = 156, r4 += 2, r4 = UZIP2.F.deflateRaw(e4, i4, r4, t3.level);
      var o3 = UZIP2.adler(e4, 0, e4.length);
      return i4[r4 + 0] = o3 >>> 24 & 255, i4[r4 + 1] = o3 >>> 16 & 255, i4[r4 + 2] = o3 >>> 8 & 255, i4[r4 + 3] = o3 >>> 0 & 255, new Uint8Array(i4.buffer, 0, r4 + 4);
    }, UZIP2.deflateRaw = function(e4, t3) {
      null == t3 && (t3 = { level: 6 });
      var r4 = new Uint8Array(50 + Math.floor(1.1 * e4.length)), i4 = UZIP2.F.deflateRaw(e4, r4, i4, t3.level);
      return new Uint8Array(r4.buffer, 0, i4);
    }, UZIP2.encode = function(e4, t3) {
      null == t3 && (t3 = false);
      var r4 = 0, i4 = UZIP2.bin.writeUint, o3 = UZIP2.bin.writeUshort, a3 = {};
      for (var s3 in e4) {
        var f3 = !UZIP2._noNeed(s3) && !t3, l3 = e4[s3], c3 = UZIP2.crc.crc(l3, 0, l3.length);
        a3[s3] = { cpr: f3, usize: l3.length, crc: c3, file: f3 ? UZIP2.deflateRaw(l3) : l3 };
      }
      for (var s3 in a3) r4 += a3[s3].file.length + 30 + 46 + 2 * UZIP2.bin.sizeUTF8(s3);
      r4 += 22;
      var u2 = new Uint8Array(r4), h2 = 0, d2 = [];
      for (var s3 in a3) {
        var A = a3[s3];
        d2.push(h2), h2 = UZIP2._writeHeader(u2, h2, s3, A, 0);
      }
      var g2 = 0, p2 = h2;
      for (var s3 in a3) {
        A = a3[s3];
        d2.push(h2), h2 = UZIP2._writeHeader(u2, h2, s3, A, 1, d2[g2++]);
      }
      var m2 = h2 - p2;
      return i4(u2, h2, 101010256), h2 += 4, o3(u2, h2 += 4, g2), o3(u2, h2 += 2, g2), i4(u2, h2 += 2, m2), i4(u2, h2 += 4, p2), h2 += 4, h2 += 2, u2.buffer;
    }, UZIP2._noNeed = function(e4) {
      var t3 = e4.split(".").pop().toLowerCase();
      return -1 != "png,jpg,jpeg,zip".indexOf(t3);
    }, UZIP2._writeHeader = function(e4, t3, r4, i4, o3, a3) {
      var s3 = UZIP2.bin.writeUint, f3 = UZIP2.bin.writeUshort, l3 = i4.file;
      return s3(e4, t3, 0 == o3 ? 67324752 : 33639248), t3 += 4, 1 == o3 && (t3 += 2), f3(e4, t3, 20), f3(e4, t3 += 2, 0), f3(e4, t3 += 2, i4.cpr ? 8 : 0), s3(e4, t3 += 2, 0), s3(e4, t3 += 4, i4.crc), s3(e4, t3 += 4, l3.length), s3(e4, t3 += 4, i4.usize), f3(e4, t3 += 4, UZIP2.bin.sizeUTF8(r4)), f3(e4, t3 += 2, 0), t3 += 2, 1 == o3 && (t3 += 2, t3 += 2, s3(e4, t3 += 6, a3), t3 += 4), t3 += UZIP2.bin.writeUTF8(e4, t3, r4), 0 == o3 && (e4.set(l3, t3), t3 += l3.length), t3;
    }, UZIP2.crc = { table: (function() {
      for (var e4 = new Uint32Array(256), t3 = 0; t3 < 256; t3++) {
        for (var r4 = t3, i4 = 0; i4 < 8; i4++) 1 & r4 ? r4 = 3988292384 ^ r4 >>> 1 : r4 >>>= 1;
        e4[t3] = r4;
      }
      return e4;
    })(), update: function(e4, t3, r4, i4) {
      for (var o3 = 0; o3 < i4; o3++) e4 = UZIP2.crc.table[255 & (e4 ^ t3[r4 + o3])] ^ e4 >>> 8;
      return e4;
    }, crc: function(e4, t3, r4) {
      return 4294967295 ^ UZIP2.crc.update(4294967295, e4, t3, r4);
    } }, UZIP2.adler = function(e4, t3, r4) {
      for (var i4 = 1, o3 = 0, a3 = t3, s3 = t3 + r4; a3 < s3; ) {
        for (var f3 = Math.min(a3 + 5552, s3); a3 < f3; ) o3 += i4 += e4[a3++];
        i4 %= 65521, o3 %= 65521;
      }
      return o3 << 16 | i4;
    }, UZIP2.bin = { readUshort: function(e4, t3) {
      return e4[t3] | e4[t3 + 1] << 8;
    }, writeUshort: function(e4, t3, r4) {
      e4[t3] = 255 & r4, e4[t3 + 1] = r4 >> 8 & 255;
    }, readUint: function(e4, t3) {
      return 16777216 * e4[t3 + 3] + (e4[t3 + 2] << 16 | e4[t3 + 1] << 8 | e4[t3]);
    }, writeUint: function(e4, t3, r4) {
      e4[t3] = 255 & r4, e4[t3 + 1] = r4 >> 8 & 255, e4[t3 + 2] = r4 >> 16 & 255, e4[t3 + 3] = r4 >> 24 & 255;
    }, readASCII: function(e4, t3, r4) {
      for (var i4 = "", o3 = 0; o3 < r4; o3++) i4 += String.fromCharCode(e4[t3 + o3]);
      return i4;
    }, writeASCII: function(e4, t3, r4) {
      for (var i4 = 0; i4 < r4.length; i4++) e4[t3 + i4] = r4.charCodeAt(i4);
    }, pad: function(e4) {
      return e4.length < 2 ? "0" + e4 : e4;
    }, readUTF8: function(e4, t3, r4) {
      for (var i4, o3 = "", a3 = 0; a3 < r4; a3++) o3 += "%" + UZIP2.bin.pad(e4[t3 + a3].toString(16));
      try {
        i4 = decodeURIComponent(o3);
      } catch (i5) {
        return UZIP2.bin.readASCII(e4, t3, r4);
      }
      return i4;
    }, writeUTF8: function(e4, t3, r4) {
      for (var i4 = r4.length, o3 = 0, a3 = 0; a3 < i4; a3++) {
        var s3 = r4.charCodeAt(a3);
        if (0 == (4294967168 & s3)) e4[t3 + o3] = s3, o3++;
        else if (0 == (4294965248 & s3)) e4[t3 + o3] = 192 | s3 >> 6, e4[t3 + o3 + 1] = 128 | s3 >> 0 & 63, o3 += 2;
        else if (0 == (4294901760 & s3)) e4[t3 + o3] = 224 | s3 >> 12, e4[t3 + o3 + 1] = 128 | s3 >> 6 & 63, e4[t3 + o3 + 2] = 128 | s3 >> 0 & 63, o3 += 3;
        else {
          if (0 != (4292870144 & s3)) throw "e";
          e4[t3 + o3] = 240 | s3 >> 18, e4[t3 + o3 + 1] = 128 | s3 >> 12 & 63, e4[t3 + o3 + 2] = 128 | s3 >> 6 & 63, e4[t3 + o3 + 3] = 128 | s3 >> 0 & 63, o3 += 4;
        }
      }
      return o3;
    }, sizeUTF8: function(e4) {
      for (var t3 = e4.length, r4 = 0, i4 = 0; i4 < t3; i4++) {
        var o3 = e4.charCodeAt(i4);
        if (0 == (4294967168 & o3)) r4++;
        else if (0 == (4294965248 & o3)) r4 += 2;
        else if (0 == (4294901760 & o3)) r4 += 3;
        else {
          if (0 != (4292870144 & o3)) throw "e";
          r4 += 4;
        }
      }
      return r4;
    } }, UZIP2.F = {}, UZIP2.F.deflateRaw = function(e4, t3, r4, i4) {
      var o3 = [[0, 0, 0, 0, 0], [4, 4, 8, 4, 0], [4, 5, 16, 8, 0], [4, 6, 16, 16, 0], [4, 10, 16, 32, 0], [8, 16, 32, 32, 0], [8, 16, 128, 128, 0], [8, 32, 128, 256, 0], [32, 128, 258, 1024, 1], [32, 258, 258, 4096, 1]][i4], a3 = UZIP2.F.U, s3 = UZIP2.F._goodIndex;
      UZIP2.F._hash;
      var f3 = UZIP2.F._putsE, l3 = 0, c3 = r4 << 3, u2 = 0, h2 = e4.length;
      if (0 == i4) {
        for (; l3 < h2; ) {
          f3(t3, c3, l3 + (_ = Math.min(65535, h2 - l3)) == h2 ? 1 : 0), c3 = UZIP2.F._copyExact(e4, l3, _, t3, c3 + 8), l3 += _;
        }
        return c3 >>> 3;
      }
      var d2 = a3.lits, A = a3.strt, g2 = a3.prev, p2 = 0, m2 = 0, w2 = 0, v2 = 0, b2 = 0, y2 = 0;
      for (h2 > 2 && (A[y2 = UZIP2.F._hash(e4, 0)] = 0), l3 = 0; l3 < h2; l3++) {
        if (b2 = y2, l3 + 1 < h2 - 2) {
          y2 = UZIP2.F._hash(e4, l3 + 1);
          var E = l3 + 1 & 32767;
          g2[E] = A[y2], A[y2] = E;
        }
        if (u2 <= l3) {
          (p2 > 14e3 || m2 > 26697) && h2 - l3 > 100 && (u2 < l3 && (d2[p2] = l3 - u2, p2 += 2, u2 = l3), c3 = UZIP2.F._writeBlock(l3 == h2 - 1 || u2 == h2 ? 1 : 0, d2, p2, v2, e4, w2, l3 - w2, t3, c3), p2 = m2 = v2 = 0, w2 = l3);
          var F = 0;
          l3 < h2 - 2 && (F = UZIP2.F._bestMatch(e4, l3, g2, b2, Math.min(o3[2], h2 - l3), o3[3]));
          var _ = F >>> 16, B = 65535 & F;
          if (0 != F) {
            B = 65535 & F;
            var U = s3(_ = F >>> 16, a3.of0);
            a3.lhst[257 + U]++;
            var C = s3(B, a3.df0);
            a3.dhst[C]++, v2 += a3.exb[U] + a3.dxb[C], d2[p2] = _ << 23 | l3 - u2, d2[p2 + 1] = B << 16 | U << 8 | C, p2 += 2, u2 = l3 + _;
          } else a3.lhst[e4[l3]]++;
          m2++;
        }
      }
      for (w2 == l3 && 0 != e4.length || (u2 < l3 && (d2[p2] = l3 - u2, p2 += 2, u2 = l3), c3 = UZIP2.F._writeBlock(1, d2, p2, v2, e4, w2, l3 - w2, t3, c3), p2 = 0, m2 = 0, p2 = m2 = v2 = 0, w2 = l3); 0 != (7 & c3); ) c3++;
      return c3 >>> 3;
    }, UZIP2.F._bestMatch = function(e4, t3, r4, i4, o3, a3) {
      var s3 = 32767 & t3, f3 = r4[s3], l3 = s3 - f3 + 32768 & 32767;
      if (f3 == s3 || i4 != UZIP2.F._hash(e4, t3 - l3)) return 0;
      for (var c3 = 0, u2 = 0, h2 = Math.min(32767, t3); l3 <= h2 && 0 != --a3 && f3 != s3; ) {
        if (0 == c3 || e4[t3 + c3] == e4[t3 + c3 - l3]) {
          var d2 = UZIP2.F._howLong(e4, t3, l3);
          if (d2 > c3) {
            if (u2 = l3, (c3 = d2) >= o3) break;
            l3 + 2 < d2 && (d2 = l3 + 2);
            for (var A = 0, g2 = 0; g2 < d2 - 2; g2++) {
              var p2 = t3 - l3 + g2 + 32768 & 32767, m2 = p2 - r4[p2] + 32768 & 32767;
              m2 > A && (A = m2, f3 = p2);
            }
          }
        }
        l3 += (s3 = f3) - (f3 = r4[s3]) + 32768 & 32767;
      }
      return c3 << 16 | u2;
    }, UZIP2.F._howLong = function(e4, t3, r4) {
      if (e4[t3] != e4[t3 - r4] || e4[t3 + 1] != e4[t3 + 1 - r4] || e4[t3 + 2] != e4[t3 + 2 - r4]) return 0;
      var i4 = t3, o3 = Math.min(e4.length, t3 + 258);
      for (t3 += 3; t3 < o3 && e4[t3] == e4[t3 - r4]; ) t3++;
      return t3 - i4;
    }, UZIP2.F._hash = function(e4, t3) {
      return (e4[t3] << 8 | e4[t3 + 1]) + (e4[t3 + 2] << 4) & 65535;
    }, UZIP2.saved = 0, UZIP2.F._writeBlock = function(e4, t3, r4, i4, o3, a3, s3, f3, l3) {
      var c3, u2, h2, d2, A, g2, p2, m2, w2, v2 = UZIP2.F.U, b2 = UZIP2.F._putsF, y2 = UZIP2.F._putsE;
      v2.lhst[256]++, u2 = (c3 = UZIP2.F.getTrees())[0], h2 = c3[1], d2 = c3[2], A = c3[3], g2 = c3[4], p2 = c3[5], m2 = c3[6], w2 = c3[7];
      var E = 32 + (0 == (l3 + 3 & 7) ? 0 : 8 - (l3 + 3 & 7)) + (s3 << 3), F = i4 + UZIP2.F.contSize(v2.fltree, v2.lhst) + UZIP2.F.contSize(v2.fdtree, v2.dhst), _ = i4 + UZIP2.F.contSize(v2.ltree, v2.lhst) + UZIP2.F.contSize(v2.dtree, v2.dhst);
      _ += 14 + 3 * p2 + UZIP2.F.contSize(v2.itree, v2.ihst) + (2 * v2.ihst[16] + 3 * v2.ihst[17] + 7 * v2.ihst[18]);
      for (var B = 0; B < 286; B++) v2.lhst[B] = 0;
      for (B = 0; B < 30; B++) v2.dhst[B] = 0;
      for (B = 0; B < 19; B++) v2.ihst[B] = 0;
      var U = E < F && E < _ ? 0 : F < _ ? 1 : 2;
      if (b2(f3, l3, e4), b2(f3, l3 + 1, U), l3 += 3, 0 == U) {
        for (; 0 != (7 & l3); ) l3++;
        l3 = UZIP2.F._copyExact(o3, a3, s3, f3, l3);
      } else {
        var C, I;
        if (1 == U && (C = v2.fltree, I = v2.fdtree), 2 == U) {
          UZIP2.F.makeCodes(v2.ltree, u2), UZIP2.F.revCodes(v2.ltree, u2), UZIP2.F.makeCodes(v2.dtree, h2), UZIP2.F.revCodes(v2.dtree, h2), UZIP2.F.makeCodes(v2.itree, d2), UZIP2.F.revCodes(v2.itree, d2), C = v2.ltree, I = v2.dtree, y2(f3, l3, A - 257), y2(f3, l3 += 5, g2 - 1), y2(f3, l3 += 5, p2 - 4), l3 += 4;
          for (var Q = 0; Q < p2; Q++) y2(f3, l3 + 3 * Q, v2.itree[1 + (v2.ordr[Q] << 1)]);
          l3 += 3 * p2, l3 = UZIP2.F._codeTiny(m2, v2.itree, f3, l3), l3 = UZIP2.F._codeTiny(w2, v2.itree, f3, l3);
        }
        for (var M2 = a3, x2 = 0; x2 < r4; x2 += 2) {
          for (var S = t3[x2], R = S >>> 23, T = M2 + (8388607 & S); M2 < T; ) l3 = UZIP2.F._writeLit(o3[M2++], C, f3, l3);
          if (0 != R) {
            var O = t3[x2 + 1], P = O >> 16, H2 = O >> 8 & 255, L = 255 & O;
            y2(f3, l3 = UZIP2.F._writeLit(257 + H2, C, f3, l3), R - v2.of0[H2]), l3 += v2.exb[H2], b2(f3, l3 = UZIP2.F._writeLit(L, I, f3, l3), P - v2.df0[L]), l3 += v2.dxb[L], M2 += R;
          }
        }
        l3 = UZIP2.F._writeLit(256, C, f3, l3);
      }
      return l3;
    }, UZIP2.F._copyExact = function(e4, t3, r4, i4, o3) {
      var a3 = o3 >>> 3;
      return i4[a3] = r4, i4[a3 + 1] = r4 >>> 8, i4[a3 + 2] = 255 - i4[a3], i4[a3 + 3] = 255 - i4[a3 + 1], a3 += 4, i4.set(new Uint8Array(e4.buffer, t3, r4), a3), o3 + (r4 + 4 << 3);
    }, UZIP2.F.getTrees = function() {
      for (var e4 = UZIP2.F.U, t3 = UZIP2.F._hufTree(e4.lhst, e4.ltree, 15), r4 = UZIP2.F._hufTree(e4.dhst, e4.dtree, 15), i4 = [], o3 = UZIP2.F._lenCodes(e4.ltree, i4), a3 = [], s3 = UZIP2.F._lenCodes(e4.dtree, a3), f3 = 0; f3 < i4.length; f3 += 2) e4.ihst[i4[f3]]++;
      for (f3 = 0; f3 < a3.length; f3 += 2) e4.ihst[a3[f3]]++;
      for (var l3 = UZIP2.F._hufTree(e4.ihst, e4.itree, 7), c3 = 19; c3 > 4 && 0 == e4.itree[1 + (e4.ordr[c3 - 1] << 1)]; ) c3--;
      return [t3, r4, l3, o3, s3, c3, i4, a3];
    }, UZIP2.F.getSecond = function(e4) {
      for (var t3 = [], r4 = 0; r4 < e4.length; r4 += 2) t3.push(e4[r4 + 1]);
      return t3;
    }, UZIP2.F.nonZero = function(e4) {
      for (var t3 = "", r4 = 0; r4 < e4.length; r4 += 2) 0 != e4[r4 + 1] && (t3 += (r4 >> 1) + ",");
      return t3;
    }, UZIP2.F.contSize = function(e4, t3) {
      for (var r4 = 0, i4 = 0; i4 < t3.length; i4++) r4 += t3[i4] * e4[1 + (i4 << 1)];
      return r4;
    }, UZIP2.F._codeTiny = function(e4, t3, r4, i4) {
      for (var o3 = 0; o3 < e4.length; o3 += 2) {
        var a3 = e4[o3], s3 = e4[o3 + 1];
        i4 = UZIP2.F._writeLit(a3, t3, r4, i4);
        var f3 = 16 == a3 ? 2 : 17 == a3 ? 3 : 7;
        a3 > 15 && (UZIP2.F._putsE(r4, i4, s3, f3), i4 += f3);
      }
      return i4;
    }, UZIP2.F._lenCodes = function(e4, t3) {
      for (var r4 = e4.length; 2 != r4 && 0 == e4[r4 - 1]; ) r4 -= 2;
      for (var i4 = 0; i4 < r4; i4 += 2) {
        var o3 = e4[i4 + 1], a3 = i4 + 3 < r4 ? e4[i4 + 3] : -1, s3 = i4 + 5 < r4 ? e4[i4 + 5] : -1, f3 = 0 == i4 ? -1 : e4[i4 - 1];
        if (0 == o3 && a3 == o3 && s3 == o3) {
          for (var l3 = i4 + 5; l3 + 2 < r4 && e4[l3 + 2] == o3; ) l3 += 2;
          (c3 = Math.min(l3 + 1 - i4 >>> 1, 138)) < 11 ? t3.push(17, c3 - 3) : t3.push(18, c3 - 11), i4 += 2 * c3 - 2;
        } else if (o3 == f3 && a3 == o3 && s3 == o3) {
          for (l3 = i4 + 5; l3 + 2 < r4 && e4[l3 + 2] == o3; ) l3 += 2;
          var c3 = Math.min(l3 + 1 - i4 >>> 1, 6);
          t3.push(16, c3 - 3), i4 += 2 * c3 - 2;
        } else t3.push(o3, 0);
      }
      return r4 >>> 1;
    }, UZIP2.F._hufTree = function(e4, t3, r4) {
      var i4 = [], o3 = e4.length, a3 = t3.length, s3 = 0;
      for (s3 = 0; s3 < a3; s3 += 2) t3[s3] = 0, t3[s3 + 1] = 0;
      for (s3 = 0; s3 < o3; s3++) 0 != e4[s3] && i4.push({ lit: s3, f: e4[s3] });
      var f3 = i4.length, l3 = i4.slice(0);
      if (0 == f3) return 0;
      if (1 == f3) {
        var c3 = i4[0].lit;
        l3 = 0 == c3 ? 1 : 0;
        return t3[1 + (c3 << 1)] = 1, t3[1 + (l3 << 1)] = 1, 1;
      }
      i4.sort((function(e5, t4) {
        return e5.f - t4.f;
      }));
      var u2 = i4[0], h2 = i4[1], d2 = 0, A = 1, g2 = 2;
      for (i4[0] = { lit: -1, f: u2.f + h2.f, l: u2, r: h2, d: 0 }; A != f3 - 1; ) u2 = d2 != A && (g2 == f3 || i4[d2].f < i4[g2].f) ? i4[d2++] : i4[g2++], h2 = d2 != A && (g2 == f3 || i4[d2].f < i4[g2].f) ? i4[d2++] : i4[g2++], i4[A++] = { lit: -1, f: u2.f + h2.f, l: u2, r: h2 };
      var p2 = UZIP2.F.setDepth(i4[A - 1], 0);
      for (p2 > r4 && (UZIP2.F.restrictDepth(l3, r4, p2), p2 = r4), s3 = 0; s3 < f3; s3++) t3[1 + (l3[s3].lit << 1)] = l3[s3].d;
      return p2;
    }, UZIP2.F.setDepth = function(e4, t3) {
      return -1 != e4.lit ? (e4.d = t3, t3) : Math.max(UZIP2.F.setDepth(e4.l, t3 + 1), UZIP2.F.setDepth(e4.r, t3 + 1));
    }, UZIP2.F.restrictDepth = function(e4, t3, r4) {
      var i4 = 0, o3 = 1 << r4 - t3, a3 = 0;
      for (e4.sort((function(e5, t4) {
        return t4.d == e5.d ? e5.f - t4.f : t4.d - e5.d;
      })), i4 = 0; i4 < e4.length && e4[i4].d > t3; i4++) {
        var s3 = e4[i4].d;
        e4[i4].d = t3, a3 += o3 - (1 << r4 - s3);
      }
      for (a3 >>>= r4 - t3; a3 > 0; ) {
        (s3 = e4[i4].d) < t3 ? (e4[i4].d++, a3 -= 1 << t3 - s3 - 1) : i4++;
      }
      for (; i4 >= 0; i4--) e4[i4].d == t3 && a3 < 0 && (e4[i4].d--, a3++);
      0 != a3 && console.log("debt left");
    }, UZIP2.F._goodIndex = function(e4, t3) {
      var r4 = 0;
      return t3[16 | r4] <= e4 && (r4 |= 16), t3[8 | r4] <= e4 && (r4 |= 8), t3[4 | r4] <= e4 && (r4 |= 4), t3[2 | r4] <= e4 && (r4 |= 2), t3[1 | r4] <= e4 && (r4 |= 1), r4;
    }, UZIP2.F._writeLit = function(e4, t3, r4, i4) {
      return UZIP2.F._putsF(r4, i4, t3[e4 << 1]), i4 + t3[1 + (e4 << 1)];
    }, UZIP2.F.inflate = function(e4, t3) {
      var r4 = Uint8Array;
      if (3 == e4[0] && 0 == e4[1]) return t3 || new r4(0);
      var i4 = UZIP2.F, o3 = i4._bitsF, a3 = i4._bitsE, s3 = i4._decodeTiny, f3 = i4.makeCodes, l3 = i4.codes2map, c3 = i4._get17, u2 = i4.U, h2 = null == t3;
      h2 && (t3 = new r4(e4.length >>> 2 << 3));
      for (var d2, A, g2 = 0, p2 = 0, m2 = 0, w2 = 0, v2 = 0, b2 = 0, y2 = 0, E = 0, F = 0; 0 == g2; ) if (g2 = o3(e4, F, 1), p2 = o3(e4, F + 1, 2), F += 3, 0 != p2) {
        if (h2 && (t3 = UZIP2.F._check(t3, E + (1 << 17))), 1 == p2 && (d2 = u2.flmap, A = u2.fdmap, b2 = 511, y2 = 31), 2 == p2) {
          m2 = a3(e4, F, 5) + 257, w2 = a3(e4, F + 5, 5) + 1, v2 = a3(e4, F + 10, 4) + 4, F += 14;
          for (var _ = 0; _ < 38; _ += 2) u2.itree[_] = 0, u2.itree[_ + 1] = 0;
          var B = 1;
          for (_ = 0; _ < v2; _++) {
            var U = a3(e4, F + 3 * _, 3);
            u2.itree[1 + (u2.ordr[_] << 1)] = U, U > B && (B = U);
          }
          F += 3 * v2, f3(u2.itree, B), l3(u2.itree, B, u2.imap), d2 = u2.lmap, A = u2.dmap, F = s3(u2.imap, (1 << B) - 1, m2 + w2, e4, F, u2.ttree);
          var C = i4._copyOut(u2.ttree, 0, m2, u2.ltree);
          b2 = (1 << C) - 1;
          var I = i4._copyOut(u2.ttree, m2, w2, u2.dtree);
          y2 = (1 << I) - 1, f3(u2.ltree, C), l3(u2.ltree, C, d2), f3(u2.dtree, I), l3(u2.dtree, I, A);
        }
        for (; ; ) {
          var Q = d2[c3(e4, F) & b2];
          F += 15 & Q;
          var M2 = Q >>> 4;
          if (M2 >>> 8 == 0) t3[E++] = M2;
          else {
            if (256 == M2) break;
            var x2 = E + M2 - 254;
            if (M2 > 264) {
              var S = u2.ldef[M2 - 257];
              x2 = E + (S >>> 3) + a3(e4, F, 7 & S), F += 7 & S;
            }
            var R = A[c3(e4, F) & y2];
            F += 15 & R;
            var T = R >>> 4, O = u2.ddef[T], P = (O >>> 4) + o3(e4, F, 15 & O);
            for (F += 15 & O, h2 && (t3 = UZIP2.F._check(t3, E + (1 << 17))); E < x2; ) t3[E] = t3[E++ - P], t3[E] = t3[E++ - P], t3[E] = t3[E++ - P], t3[E] = t3[E++ - P];
            E = x2;
          }
        }
      } else {
        0 != (7 & F) && (F += 8 - (7 & F));
        var H2 = 4 + (F >>> 3), L = e4[H2 - 4] | e4[H2 - 3] << 8;
        h2 && (t3 = UZIP2.F._check(t3, E + L)), t3.set(new r4(e4.buffer, e4.byteOffset + H2, L), E), F = H2 + L << 3, E += L;
      }
      return t3.length == E ? t3 : t3.slice(0, E);
    }, UZIP2.F._check = function(e4, t3) {
      var r4 = e4.length;
      if (t3 <= r4) return e4;
      var i4 = new Uint8Array(Math.max(r4 << 1, t3));
      return i4.set(e4, 0), i4;
    }, UZIP2.F._decodeTiny = function(e4, t3, r4, i4, o3, a3) {
      for (var s3 = UZIP2.F._bitsE, f3 = UZIP2.F._get17, l3 = 0; l3 < r4; ) {
        var c3 = e4[f3(i4, o3) & t3];
        o3 += 15 & c3;
        var u2 = c3 >>> 4;
        if (u2 <= 15) a3[l3] = u2, l3++;
        else {
          var h2 = 0, d2 = 0;
          16 == u2 ? (d2 = 3 + s3(i4, o3, 2), o3 += 2, h2 = a3[l3 - 1]) : 17 == u2 ? (d2 = 3 + s3(i4, o3, 3), o3 += 3) : 18 == u2 && (d2 = 11 + s3(i4, o3, 7), o3 += 7);
          for (var A = l3 + d2; l3 < A; ) a3[l3] = h2, l3++;
        }
      }
      return o3;
    }, UZIP2.F._copyOut = function(e4, t3, r4, i4) {
      for (var o3 = 0, a3 = 0, s3 = i4.length >>> 1; a3 < r4; ) {
        var f3 = e4[a3 + t3];
        i4[a3 << 1] = 0, i4[1 + (a3 << 1)] = f3, f3 > o3 && (o3 = f3), a3++;
      }
      for (; a3 < s3; ) i4[a3 << 1] = 0, i4[1 + (a3 << 1)] = 0, a3++;
      return o3;
    }, UZIP2.F.makeCodes = function(e4, t3) {
      for (var r4, i4, o3, a3, s3 = UZIP2.F.U, f3 = e4.length, l3 = s3.bl_count, c3 = 0; c3 <= t3; c3++) l3[c3] = 0;
      for (c3 = 1; c3 < f3; c3 += 2) l3[e4[c3]]++;
      var u2 = s3.next_code;
      for (r4 = 0, l3[0] = 0, i4 = 1; i4 <= t3; i4++) r4 = r4 + l3[i4 - 1] << 1, u2[i4] = r4;
      for (o3 = 0; o3 < f3; o3 += 2) 0 != (a3 = e4[o3 + 1]) && (e4[o3] = u2[a3], u2[a3]++);
    }, UZIP2.F.codes2map = function(e4, t3, r4) {
      for (var i4 = e4.length, o3 = UZIP2.F.U.rev15, a3 = 0; a3 < i4; a3 += 2) if (0 != e4[a3 + 1]) for (var s3 = a3 >> 1, f3 = e4[a3 + 1], l3 = s3 << 4 | f3, c3 = t3 - f3, u2 = e4[a3] << c3, h2 = u2 + (1 << c3); u2 != h2; ) {
        r4[o3[u2] >>> 15 - t3] = l3, u2++;
      }
    }, UZIP2.F.revCodes = function(e4, t3) {
      for (var r4 = UZIP2.F.U.rev15, i4 = 15 - t3, o3 = 0; o3 < e4.length; o3 += 2) {
        var a3 = e4[o3] << t3 - e4[o3 + 1];
        e4[o3] = r4[a3] >>> i4;
      }
    }, UZIP2.F._putsE = function(e4, t3, r4) {
      r4 <<= 7 & t3;
      var i4 = t3 >>> 3;
      e4[i4] |= r4, e4[i4 + 1] |= r4 >>> 8;
    }, UZIP2.F._putsF = function(e4, t3, r4) {
      r4 <<= 7 & t3;
      var i4 = t3 >>> 3;
      e4[i4] |= r4, e4[i4 + 1] |= r4 >>> 8, e4[i4 + 2] |= r4 >>> 16;
    }, UZIP2.F._bitsE = function(e4, t3, r4) {
      return (e4[t3 >>> 3] | e4[1 + (t3 >>> 3)] << 8) >>> (7 & t3) & (1 << r4) - 1;
    }, UZIP2.F._bitsF = function(e4, t3, r4) {
      return (e4[t3 >>> 3] | e4[1 + (t3 >>> 3)] << 8 | e4[2 + (t3 >>> 3)] << 16) >>> (7 & t3) & (1 << r4) - 1;
    }, UZIP2.F._get17 = function(e4, t3) {
      return (e4[t3 >>> 3] | e4[1 + (t3 >>> 3)] << 8 | e4[2 + (t3 >>> 3)] << 16) >>> (7 & t3);
    }, UZIP2.F._get25 = function(e4, t3) {
      return (e4[t3 >>> 3] | e4[1 + (t3 >>> 3)] << 8 | e4[2 + (t3 >>> 3)] << 16 | e4[3 + (t3 >>> 3)] << 24) >>> (7 & t3);
    }, UZIP2.F.U = (r3 = Uint16Array, i3 = Uint32Array, { next_code: new r3(16), bl_count: new r3(16), ordr: [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], of0: [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 999, 999, 999], exb: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0, 0], ldef: new r3(32), df0: [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 65535, 65535], dxb: [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 0, 0], ddef: new i3(32), flmap: new r3(512), fltree: [], fdmap: new r3(32), fdtree: [], lmap: new r3(32768), ltree: [], ttree: [], dmap: new r3(32768), dtree: [], imap: new r3(512), itree: [], rev15: new r3(32768), lhst: new i3(286), dhst: new i3(30), ihst: new i3(19), lits: new i3(15e3), strt: new r3(65536), prev: new r3(32768) }), (function() {
      for (var e4 = UZIP2.F.U, t3 = 0; t3 < 32768; t3++) {
        var r4 = t3;
        r4 = (4278255360 & (r4 = (4042322160 & (r4 = (3435973836 & (r4 = (2863311530 & r4) >>> 1 | (1431655765 & r4) << 1)) >>> 2 | (858993459 & r4) << 2)) >>> 4 | (252645135 & r4) << 4)) >>> 8 | (16711935 & r4) << 8, e4.rev15[t3] = (r4 >>> 16 | r4 << 16) >>> 17;
      }
      function pushV(e5, t4, r5) {
        for (; 0 != t4--; ) e5.push(0, r5);
      }
      for (t3 = 0; t3 < 32; t3++) e4.ldef[t3] = e4.of0[t3] << 3 | e4.exb[t3], e4.ddef[t3] = e4.df0[t3] << 4 | e4.dxb[t3];
      pushV(e4.fltree, 144, 8), pushV(e4.fltree, 112, 9), pushV(e4.fltree, 24, 7), pushV(e4.fltree, 8, 8), UZIP2.F.makeCodes(e4.fltree, 9), UZIP2.F.codes2map(e4.fltree, 9, e4.flmap), UZIP2.F.revCodes(e4.fltree, 9), pushV(e4.fdtree, 32, 5), UZIP2.F.makeCodes(e4.fdtree, 5), UZIP2.F.codes2map(e4.fdtree, 5, e4.fdmap), UZIP2.F.revCodes(e4.fdtree, 5), pushV(e4.itree, 19, 0), pushV(e4.ltree, 286, 0), pushV(e4.dtree, 30, 0), pushV(e4.ttree, 320, 0);
    })();
  })();
  var UZIP = _mergeNamespaces({ __proto__: null, default: e }, [e]);
  var UPNG = (function() {
    var e3 = { nextZero(e4, t4) {
      for (; 0 != e4[t4]; ) t4++;
      return t4;
    }, readUshort: (e4, t4) => e4[t4] << 8 | e4[t4 + 1], writeUshort(e4, t4, r3) {
      e4[t4] = r3 >> 8 & 255, e4[t4 + 1] = 255 & r3;
    }, readUint: (e4, t4) => 16777216 * e4[t4] + (e4[t4 + 1] << 16 | e4[t4 + 2] << 8 | e4[t4 + 3]), writeUint(e4, t4, r3) {
      e4[t4] = r3 >> 24 & 255, e4[t4 + 1] = r3 >> 16 & 255, e4[t4 + 2] = r3 >> 8 & 255, e4[t4 + 3] = 255 & r3;
    }, readASCII(e4, t4, r3) {
      let i3 = "";
      for (let o3 = 0; o3 < r3; o3++) i3 += String.fromCharCode(e4[t4 + o3]);
      return i3;
    }, writeASCII(e4, t4, r3) {
      for (let i3 = 0; i3 < r3.length; i3++) e4[t4 + i3] = r3.charCodeAt(i3);
    }, readBytes(e4, t4, r3) {
      const i3 = [];
      for (let o3 = 0; o3 < r3; o3++) i3.push(e4[t4 + o3]);
      return i3;
    }, pad: (e4) => e4.length < 2 ? `0${e4}` : e4, readUTF8(t4, r3, i3) {
      let o3, a3 = "";
      for (let o4 = 0; o4 < i3; o4++) a3 += `%${e3.pad(t4[r3 + o4].toString(16))}`;
      try {
        o3 = decodeURIComponent(a3);
      } catch (o4) {
        return e3.readASCII(t4, r3, i3);
      }
      return o3;
    } };
    function decodeImage(t4, r3, i3, o3) {
      const a3 = r3 * i3, s3 = _getBPP(o3), f3 = Math.ceil(r3 * s3 / 8), l3 = new Uint8Array(4 * a3), c3 = new Uint32Array(l3.buffer), { ctype: u2 } = o3, { depth: h2 } = o3, d2 = e3.readUshort;
      if (6 == u2) {
        const e4 = a3 << 2;
        if (8 == h2) for (var A = 0; A < e4; A += 4) l3[A] = t4[A], l3[A + 1] = t4[A + 1], l3[A + 2] = t4[A + 2], l3[A + 3] = t4[A + 3];
        if (16 == h2) for (A = 0; A < e4; A++) l3[A] = t4[A << 1];
      } else if (2 == u2) {
        const e4 = o3.tabs.tRNS;
        if (null == e4) {
          if (8 == h2) for (A = 0; A < a3; A++) {
            var g2 = 3 * A;
            c3[A] = 255 << 24 | t4[g2 + 2] << 16 | t4[g2 + 1] << 8 | t4[g2];
          }
          if (16 == h2) for (A = 0; A < a3; A++) {
            g2 = 6 * A;
            c3[A] = 255 << 24 | t4[g2 + 4] << 16 | t4[g2 + 2] << 8 | t4[g2];
          }
        } else {
          var p2 = e4[0];
          const r4 = e4[1], i4 = e4[2];
          if (8 == h2) for (A = 0; A < a3; A++) {
            var m2 = A << 2;
            g2 = 3 * A;
            c3[A] = 255 << 24 | t4[g2 + 2] << 16 | t4[g2 + 1] << 8 | t4[g2], t4[g2] == p2 && t4[g2 + 1] == r4 && t4[g2 + 2] == i4 && (l3[m2 + 3] = 0);
          }
          if (16 == h2) for (A = 0; A < a3; A++) {
            m2 = A << 2, g2 = 6 * A;
            c3[A] = 255 << 24 | t4[g2 + 4] << 16 | t4[g2 + 2] << 8 | t4[g2], d2(t4, g2) == p2 && d2(t4, g2 + 2) == r4 && d2(t4, g2 + 4) == i4 && (l3[m2 + 3] = 0);
          }
        }
      } else if (3 == u2) {
        const e4 = o3.tabs.PLTE, s4 = o3.tabs.tRNS, c4 = s4 ? s4.length : 0;
        if (1 == h2) for (var w2 = 0; w2 < i3; w2++) {
          var v2 = w2 * f3, b2 = w2 * r3;
          for (A = 0; A < r3; A++) {
            m2 = b2 + A << 2;
            var y2 = 3 * (E = t4[v2 + (A >> 3)] >> 7 - ((7 & A) << 0) & 1);
            l3[m2] = e4[y2], l3[m2 + 1] = e4[y2 + 1], l3[m2 + 2] = e4[y2 + 2], l3[m2 + 3] = E < c4 ? s4[E] : 255;
          }
        }
        if (2 == h2) for (w2 = 0; w2 < i3; w2++) for (v2 = w2 * f3, b2 = w2 * r3, A = 0; A < r3; A++) {
          m2 = b2 + A << 2, y2 = 3 * (E = t4[v2 + (A >> 2)] >> 6 - ((3 & A) << 1) & 3);
          l3[m2] = e4[y2], l3[m2 + 1] = e4[y2 + 1], l3[m2 + 2] = e4[y2 + 2], l3[m2 + 3] = E < c4 ? s4[E] : 255;
        }
        if (4 == h2) for (w2 = 0; w2 < i3; w2++) for (v2 = w2 * f3, b2 = w2 * r3, A = 0; A < r3; A++) {
          m2 = b2 + A << 2, y2 = 3 * (E = t4[v2 + (A >> 1)] >> 4 - ((1 & A) << 2) & 15);
          l3[m2] = e4[y2], l3[m2 + 1] = e4[y2 + 1], l3[m2 + 2] = e4[y2 + 2], l3[m2 + 3] = E < c4 ? s4[E] : 255;
        }
        if (8 == h2) for (A = 0; A < a3; A++) {
          var E;
          m2 = A << 2, y2 = 3 * (E = t4[A]);
          l3[m2] = e4[y2], l3[m2 + 1] = e4[y2 + 1], l3[m2 + 2] = e4[y2 + 2], l3[m2 + 3] = E < c4 ? s4[E] : 255;
        }
      } else if (4 == u2) {
        if (8 == h2) for (A = 0; A < a3; A++) {
          m2 = A << 2;
          var F = t4[_ = A << 1];
          l3[m2] = F, l3[m2 + 1] = F, l3[m2 + 2] = F, l3[m2 + 3] = t4[_ + 1];
        }
        if (16 == h2) for (A = 0; A < a3; A++) {
          var _;
          m2 = A << 2, F = t4[_ = A << 2];
          l3[m2] = F, l3[m2 + 1] = F, l3[m2 + 2] = F, l3[m2 + 3] = t4[_ + 2];
        }
      } else if (0 == u2) for (p2 = o3.tabs.tRNS ? o3.tabs.tRNS : -1, w2 = 0; w2 < i3; w2++) {
        const e4 = w2 * f3, i4 = w2 * r3;
        if (1 == h2) for (var B = 0; B < r3; B++) {
          var U = (F = 255 * (t4[e4 + (B >>> 3)] >>> 7 - (7 & B) & 1)) == 255 * p2 ? 0 : 255;
          c3[i4 + B] = U << 24 | F << 16 | F << 8 | F;
        }
        else if (2 == h2) for (B = 0; B < r3; B++) {
          U = (F = 85 * (t4[e4 + (B >>> 2)] >>> 6 - ((3 & B) << 1) & 3)) == 85 * p2 ? 0 : 255;
          c3[i4 + B] = U << 24 | F << 16 | F << 8 | F;
        }
        else if (4 == h2) for (B = 0; B < r3; B++) {
          U = (F = 17 * (t4[e4 + (B >>> 1)] >>> 4 - ((1 & B) << 2) & 15)) == 17 * p2 ? 0 : 255;
          c3[i4 + B] = U << 24 | F << 16 | F << 8 | F;
        }
        else if (8 == h2) for (B = 0; B < r3; B++) {
          U = (F = t4[e4 + B]) == p2 ? 0 : 255;
          c3[i4 + B] = U << 24 | F << 16 | F << 8 | F;
        }
        else if (16 == h2) for (B = 0; B < r3; B++) {
          F = t4[e4 + (B << 1)], U = d2(t4, e4 + (B << 1)) == p2 ? 0 : 255;
          c3[i4 + B] = U << 24 | F << 16 | F << 8 | F;
        }
      }
      return l3;
    }
    function _decompress(e4, r3, i3, o3) {
      const a3 = _getBPP(e4), s3 = Math.ceil(i3 * a3 / 8), f3 = new Uint8Array((s3 + 1 + e4.interlace) * o3);
      return r3 = e4.tabs.CgBI ? t3(r3, f3) : _inflate(r3, f3), 0 == e4.interlace ? r3 = _filterZero(r3, e4, 0, i3, o3) : 1 == e4.interlace && (r3 = (function _readInterlace(e5, t4) {
        const r4 = t4.width, i4 = t4.height, o4 = _getBPP(t4), a4 = o4 >> 3, s4 = Math.ceil(r4 * o4 / 8), f4 = new Uint8Array(i4 * s4);
        let l3 = 0;
        const c3 = [0, 0, 4, 0, 2, 0, 1], u2 = [0, 4, 0, 2, 0, 1, 0], h2 = [8, 8, 8, 4, 4, 2, 2], d2 = [8, 8, 4, 4, 2, 2, 1];
        let A = 0;
        for (; A < 7; ) {
          const p2 = h2[A], m2 = d2[A];
          let w2 = 0, v2 = 0, b2 = c3[A];
          for (; b2 < i4; ) b2 += p2, v2++;
          let y2 = u2[A];
          for (; y2 < r4; ) y2 += m2, w2++;
          const E = Math.ceil(w2 * o4 / 8);
          _filterZero(e5, t4, l3, w2, v2);
          let F = 0, _ = c3[A];
          for (; _ < i4; ) {
            let t5 = u2[A], i5 = l3 + F * E << 3;
            for (; t5 < r4; ) {
              var g2;
              if (1 == o4) g2 = (g2 = e5[i5 >> 3]) >> 7 - (7 & i5) & 1, f4[_ * s4 + (t5 >> 3)] |= g2 << 7 - ((7 & t5) << 0);
              if (2 == o4) g2 = (g2 = e5[i5 >> 3]) >> 6 - (7 & i5) & 3, f4[_ * s4 + (t5 >> 2)] |= g2 << 6 - ((3 & t5) << 1);
              if (4 == o4) g2 = (g2 = e5[i5 >> 3]) >> 4 - (7 & i5) & 15, f4[_ * s4 + (t5 >> 1)] |= g2 << 4 - ((1 & t5) << 2);
              if (o4 >= 8) {
                const r5 = _ * s4 + t5 * a4;
                for (let t6 = 0; t6 < a4; t6++) f4[r5 + t6] = e5[(i5 >> 3) + t6];
              }
              i5 += o4, t5 += m2;
            }
            F++, _ += p2;
          }
          w2 * v2 != 0 && (l3 += v2 * (1 + E)), A += 1;
        }
        return f4;
      })(r3, e4)), r3;
    }
    function _inflate(e4, r3) {
      return t3(new Uint8Array(e4.buffer, 2, e4.length - 6), r3);
    }
    var t3 = (function() {
      const e4 = { H: {} };
      return e4.H.N = function(t4, r3) {
        const i3 = Uint8Array;
        let o3, a3, s3 = 0, f3 = 0, l3 = 0, c3 = 0, u2 = 0, h2 = 0, d2 = 0, A = 0, g2 = 0;
        if (3 == t4[0] && 0 == t4[1]) return r3 || new i3(0);
        const p2 = e4.H, m2 = p2.b, w2 = p2.e, v2 = p2.R, b2 = p2.n, y2 = p2.A, E = p2.Z, F = p2.m, _ = null == r3;
        for (_ && (r3 = new i3(t4.length >>> 2 << 5)); 0 == s3; ) if (s3 = m2(t4, g2, 1), f3 = m2(t4, g2 + 1, 2), g2 += 3, 0 != f3) {
          if (_ && (r3 = e4.H.W(r3, A + (1 << 17))), 1 == f3 && (o3 = F.J, a3 = F.h, h2 = 511, d2 = 31), 2 == f3) {
            l3 = w2(t4, g2, 5) + 257, c3 = w2(t4, g2 + 5, 5) + 1, u2 = w2(t4, g2 + 10, 4) + 4, g2 += 14;
            let e5 = 1;
            for (var B = 0; B < 38; B += 2) F.Q[B] = 0, F.Q[B + 1] = 0;
            for (B = 0; B < u2; B++) {
              const r5 = w2(t4, g2 + 3 * B, 3);
              F.Q[1 + (F.X[B] << 1)] = r5, r5 > e5 && (e5 = r5);
            }
            g2 += 3 * u2, b2(F.Q, e5), y2(F.Q, e5, F.u), o3 = F.w, a3 = F.d, g2 = v2(F.u, (1 << e5) - 1, l3 + c3, t4, g2, F.v);
            const r4 = p2.V(F.v, 0, l3, F.C);
            h2 = (1 << r4) - 1;
            const i4 = p2.V(F.v, l3, c3, F.D);
            d2 = (1 << i4) - 1, b2(F.C, r4), y2(F.C, r4, o3), b2(F.D, i4), y2(F.D, i4, a3);
          }
          for (; ; ) {
            const e5 = o3[E(t4, g2) & h2];
            g2 += 15 & e5;
            const i4 = e5 >>> 4;
            if (i4 >>> 8 == 0) r3[A++] = i4;
            else {
              if (256 == i4) break;
              {
                let e6 = A + i4 - 254;
                if (i4 > 264) {
                  const r4 = F.q[i4 - 257];
                  e6 = A + (r4 >>> 3) + w2(t4, g2, 7 & r4), g2 += 7 & r4;
                }
                const o4 = a3[E(t4, g2) & d2];
                g2 += 15 & o4;
                const s4 = o4 >>> 4, f4 = F.c[s4], l4 = (f4 >>> 4) + m2(t4, g2, 15 & f4);
                for (g2 += 15 & f4; A < e6; ) r3[A] = r3[A++ - l4], r3[A] = r3[A++ - l4], r3[A] = r3[A++ - l4], r3[A] = r3[A++ - l4];
                A = e6;
              }
            }
          }
        } else {
          0 != (7 & g2) && (g2 += 8 - (7 & g2));
          const o4 = 4 + (g2 >>> 3), a4 = t4[o4 - 4] | t4[o4 - 3] << 8;
          _ && (r3 = e4.H.W(r3, A + a4)), r3.set(new i3(t4.buffer, t4.byteOffset + o4, a4), A), g2 = o4 + a4 << 3, A += a4;
        }
        return r3.length == A ? r3 : r3.slice(0, A);
      }, e4.H.W = function(e5, t4) {
        const r3 = e5.length;
        if (t4 <= r3) return e5;
        const i3 = new Uint8Array(r3 << 1);
        return i3.set(e5, 0), i3;
      }, e4.H.R = function(t4, r3, i3, o3, a3, s3) {
        const f3 = e4.H.e, l3 = e4.H.Z;
        let c3 = 0;
        for (; c3 < i3; ) {
          const e5 = t4[l3(o3, a3) & r3];
          a3 += 15 & e5;
          const i4 = e5 >>> 4;
          if (i4 <= 15) s3[c3] = i4, c3++;
          else {
            let e6 = 0, t5 = 0;
            16 == i4 ? (t5 = 3 + f3(o3, a3, 2), a3 += 2, e6 = s3[c3 - 1]) : 17 == i4 ? (t5 = 3 + f3(o3, a3, 3), a3 += 3) : 18 == i4 && (t5 = 11 + f3(o3, a3, 7), a3 += 7);
            const r4 = c3 + t5;
            for (; c3 < r4; ) s3[c3] = e6, c3++;
          }
        }
        return a3;
      }, e4.H.V = function(e5, t4, r3, i3) {
        let o3 = 0, a3 = 0;
        const s3 = i3.length >>> 1;
        for (; a3 < r3; ) {
          const r4 = e5[a3 + t4];
          i3[a3 << 1] = 0, i3[1 + (a3 << 1)] = r4, r4 > o3 && (o3 = r4), a3++;
        }
        for (; a3 < s3; ) i3[a3 << 1] = 0, i3[1 + (a3 << 1)] = 0, a3++;
        return o3;
      }, e4.H.n = function(t4, r3) {
        const i3 = e4.H.m, o3 = t4.length;
        let a3, s3, f3;
        let l3;
        const c3 = i3.j;
        for (var u2 = 0; u2 <= r3; u2++) c3[u2] = 0;
        for (u2 = 1; u2 < o3; u2 += 2) c3[t4[u2]]++;
        const h2 = i3.K;
        for (a3 = 0, c3[0] = 0, s3 = 1; s3 <= r3; s3++) a3 = a3 + c3[s3 - 1] << 1, h2[s3] = a3;
        for (f3 = 0; f3 < o3; f3 += 2) l3 = t4[f3 + 1], 0 != l3 && (t4[f3] = h2[l3], h2[l3]++);
      }, e4.H.A = function(t4, r3, i3) {
        const o3 = t4.length, a3 = e4.H.m.r;
        for (let e5 = 0; e5 < o3; e5 += 2) if (0 != t4[e5 + 1]) {
          const o4 = e5 >> 1, s3 = t4[e5 + 1], f3 = o4 << 4 | s3, l3 = r3 - s3;
          let c3 = t4[e5] << l3;
          const u2 = c3 + (1 << l3);
          for (; c3 != u2; ) {
            i3[a3[c3] >>> 15 - r3] = f3, c3++;
          }
        }
      }, e4.H.l = function(t4, r3) {
        const i3 = e4.H.m.r, o3 = 15 - r3;
        for (let e5 = 0; e5 < t4.length; e5 += 2) {
          const a3 = t4[e5] << r3 - t4[e5 + 1];
          t4[e5] = i3[a3] >>> o3;
        }
      }, e4.H.M = function(e5, t4, r3) {
        r3 <<= 7 & t4;
        const i3 = t4 >>> 3;
        e5[i3] |= r3, e5[i3 + 1] |= r3 >>> 8;
      }, e4.H.I = function(e5, t4, r3) {
        r3 <<= 7 & t4;
        const i3 = t4 >>> 3;
        e5[i3] |= r3, e5[i3 + 1] |= r3 >>> 8, e5[i3 + 2] |= r3 >>> 16;
      }, e4.H.e = function(e5, t4, r3) {
        return (e5[t4 >>> 3] | e5[1 + (t4 >>> 3)] << 8) >>> (7 & t4) & (1 << r3) - 1;
      }, e4.H.b = function(e5, t4, r3) {
        return (e5[t4 >>> 3] | e5[1 + (t4 >>> 3)] << 8 | e5[2 + (t4 >>> 3)] << 16) >>> (7 & t4) & (1 << r3) - 1;
      }, e4.H.Z = function(e5, t4) {
        return (e5[t4 >>> 3] | e5[1 + (t4 >>> 3)] << 8 | e5[2 + (t4 >>> 3)] << 16) >>> (7 & t4);
      }, e4.H.i = function(e5, t4) {
        return (e5[t4 >>> 3] | e5[1 + (t4 >>> 3)] << 8 | e5[2 + (t4 >>> 3)] << 16 | e5[3 + (t4 >>> 3)] << 24) >>> (7 & t4);
      }, e4.H.m = (function() {
        const e5 = Uint16Array, t4 = Uint32Array;
        return { K: new e5(16), j: new e5(16), X: [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], S: [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 999, 999, 999], T: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0, 0], q: new e5(32), p: [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 65535, 65535], z: [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 0, 0], c: new t4(32), J: new e5(512), _: [], h: new e5(32), $: [], w: new e5(32768), C: [], v: [], d: new e5(32768), D: [], u: new e5(512), Q: [], r: new e5(32768), s: new t4(286), Y: new t4(30), a: new t4(19), t: new t4(15e3), k: new e5(65536), g: new e5(32768) };
      })(), (function() {
        const t4 = e4.H.m;
        for (var r3 = 0; r3 < 32768; r3++) {
          let e5 = r3;
          e5 = (2863311530 & e5) >>> 1 | (1431655765 & e5) << 1, e5 = (3435973836 & e5) >>> 2 | (858993459 & e5) << 2, e5 = (4042322160 & e5) >>> 4 | (252645135 & e5) << 4, e5 = (4278255360 & e5) >>> 8 | (16711935 & e5) << 8, t4.r[r3] = (e5 >>> 16 | e5 << 16) >>> 17;
        }
        function n2(e5, t5, r4) {
          for (; 0 != t5--; ) e5.push(0, r4);
        }
        for (r3 = 0; r3 < 32; r3++) t4.q[r3] = t4.S[r3] << 3 | t4.T[r3], t4.c[r3] = t4.p[r3] << 4 | t4.z[r3];
        n2(t4._, 144, 8), n2(t4._, 112, 9), n2(t4._, 24, 7), n2(t4._, 8, 8), e4.H.n(t4._, 9), e4.H.A(t4._, 9, t4.J), e4.H.l(t4._, 9), n2(t4.$, 32, 5), e4.H.n(t4.$, 5), e4.H.A(t4.$, 5, t4.h), e4.H.l(t4.$, 5), n2(t4.Q, 19, 0), n2(t4.C, 286, 0), n2(t4.D, 30, 0), n2(t4.v, 320, 0);
      })(), e4.H.N;
    })();
    function _getBPP(e4) {
      return [1, null, 3, 1, 2, null, 4][e4.ctype] * e4.depth;
    }
    function _filterZero(e4, t4, r3, i3, o3) {
      let a3 = _getBPP(t4);
      const s3 = Math.ceil(i3 * a3 / 8);
      let f3, l3;
      a3 = Math.ceil(a3 / 8);
      let c3 = e4[r3], u2 = 0;
      if (c3 > 1 && (e4[r3] = [0, 0, 1][c3 - 2]), 3 == c3) for (u2 = a3; u2 < s3; u2++) e4[u2 + 1] = e4[u2 + 1] + (e4[u2 + 1 - a3] >>> 1) & 255;
      for (let t5 = 0; t5 < o3; t5++) if (f3 = r3 + t5 * s3, l3 = f3 + t5 + 1, c3 = e4[l3 - 1], u2 = 0, 0 == c3) for (; u2 < s3; u2++) e4[f3 + u2] = e4[l3 + u2];
      else if (1 == c3) {
        for (; u2 < a3; u2++) e4[f3 + u2] = e4[l3 + u2];
        for (; u2 < s3; u2++) e4[f3 + u2] = e4[l3 + u2] + e4[f3 + u2 - a3];
      } else if (2 == c3) for (; u2 < s3; u2++) e4[f3 + u2] = e4[l3 + u2] + e4[f3 + u2 - s3];
      else if (3 == c3) {
        for (; u2 < a3; u2++) e4[f3 + u2] = e4[l3 + u2] + (e4[f3 + u2 - s3] >>> 1);
        for (; u2 < s3; u2++) e4[f3 + u2] = e4[l3 + u2] + (e4[f3 + u2 - s3] + e4[f3 + u2 - a3] >>> 1);
      } else {
        for (; u2 < a3; u2++) e4[f3 + u2] = e4[l3 + u2] + _paeth(0, e4[f3 + u2 - s3], 0);
        for (; u2 < s3; u2++) e4[f3 + u2] = e4[l3 + u2] + _paeth(e4[f3 + u2 - a3], e4[f3 + u2 - s3], e4[f3 + u2 - a3 - s3]);
      }
      return e4;
    }
    function _paeth(e4, t4, r3) {
      const i3 = e4 + t4 - r3, o3 = i3 - e4, a3 = i3 - t4, s3 = i3 - r3;
      return o3 * o3 <= a3 * a3 && o3 * o3 <= s3 * s3 ? e4 : a3 * a3 <= s3 * s3 ? t4 : r3;
    }
    function _IHDR(t4, r3, i3) {
      i3.width = e3.readUint(t4, r3), r3 += 4, i3.height = e3.readUint(t4, r3), r3 += 4, i3.depth = t4[r3], r3++, i3.ctype = t4[r3], r3++, i3.compress = t4[r3], r3++, i3.filter = t4[r3], r3++, i3.interlace = t4[r3], r3++;
    }
    function _copyTile(e4, t4, r3, i3, o3, a3, s3, f3, l3) {
      const c3 = Math.min(t4, o3), u2 = Math.min(r3, a3);
      let h2 = 0, d2 = 0;
      for (let r4 = 0; r4 < u2; r4++) for (let a4 = 0; a4 < c3; a4++) if (s3 >= 0 && f3 >= 0 ? (h2 = r4 * t4 + a4 << 2, d2 = (f3 + r4) * o3 + s3 + a4 << 2) : (h2 = (-f3 + r4) * t4 - s3 + a4 << 2, d2 = r4 * o3 + a4 << 2), 0 == l3) i3[d2] = e4[h2], i3[d2 + 1] = e4[h2 + 1], i3[d2 + 2] = e4[h2 + 2], i3[d2 + 3] = e4[h2 + 3];
      else if (1 == l3) {
        var A = e4[h2 + 3] * (1 / 255), g2 = e4[h2] * A, p2 = e4[h2 + 1] * A, m2 = e4[h2 + 2] * A, w2 = i3[d2 + 3] * (1 / 255), v2 = i3[d2] * w2, b2 = i3[d2 + 1] * w2, y2 = i3[d2 + 2] * w2;
        const t5 = 1 - A, r5 = A + w2 * t5, o4 = 0 == r5 ? 0 : 1 / r5;
        i3[d2 + 3] = 255 * r5, i3[d2 + 0] = (g2 + v2 * t5) * o4, i3[d2 + 1] = (p2 + b2 * t5) * o4, i3[d2 + 2] = (m2 + y2 * t5) * o4;
      } else if (2 == l3) {
        A = e4[h2 + 3], g2 = e4[h2], p2 = e4[h2 + 1], m2 = e4[h2 + 2], w2 = i3[d2 + 3], v2 = i3[d2], b2 = i3[d2 + 1], y2 = i3[d2 + 2];
        A == w2 && g2 == v2 && p2 == b2 && m2 == y2 ? (i3[d2] = 0, i3[d2 + 1] = 0, i3[d2 + 2] = 0, i3[d2 + 3] = 0) : (i3[d2] = g2, i3[d2 + 1] = p2, i3[d2 + 2] = m2, i3[d2 + 3] = A);
      } else if (3 == l3) {
        A = e4[h2 + 3], g2 = e4[h2], p2 = e4[h2 + 1], m2 = e4[h2 + 2], w2 = i3[d2 + 3], v2 = i3[d2], b2 = i3[d2 + 1], y2 = i3[d2 + 2];
        if (A == w2 && g2 == v2 && p2 == b2 && m2 == y2) continue;
        if (A < 220 && w2 > 20) return false;
      }
      return true;
    }
    return { decode: function decode(r3) {
      const i3 = new Uint8Array(r3);
      let o3 = 8;
      const a3 = e3, s3 = a3.readUshort, f3 = a3.readUint, l3 = { tabs: {}, frames: [] }, c3 = new Uint8Array(i3.length);
      let u2, h2 = 0, d2 = 0;
      const A = [137, 80, 78, 71, 13, 10, 26, 10];
      for (var g2 = 0; g2 < 8; g2++) if (i3[g2] != A[g2]) throw "The input is not a PNG file!";
      for (; o3 < i3.length; ) {
        const e4 = a3.readUint(i3, o3);
        o3 += 4;
        const r4 = a3.readASCII(i3, o3, 4);
        if (o3 += 4, "IHDR" == r4) _IHDR(i3, o3, l3);
        else if ("iCCP" == r4) {
          for (var p2 = o3; 0 != i3[p2]; ) p2++;
          a3.readASCII(i3, o3, p2 - o3), i3[p2 + 1];
          const s4 = i3.slice(p2 + 2, o3 + e4);
          let f4 = null;
          try {
            f4 = _inflate(s4);
          } catch (e5) {
            f4 = t3(s4);
          }
          l3.tabs[r4] = f4;
        } else if ("CgBI" == r4) l3.tabs[r4] = i3.slice(o3, o3 + 4);
        else if ("IDAT" == r4) {
          for (g2 = 0; g2 < e4; g2++) c3[h2 + g2] = i3[o3 + g2];
          h2 += e4;
        } else if ("acTL" == r4) l3.tabs[r4] = { num_frames: f3(i3, o3), num_plays: f3(i3, o3 + 4) }, u2 = new Uint8Array(i3.length);
        else if ("fcTL" == r4) {
          if (0 != d2) (E = l3.frames[l3.frames.length - 1]).data = _decompress(l3, u2.slice(0, d2), E.rect.width, E.rect.height), d2 = 0;
          const e5 = { x: f3(i3, o3 + 12), y: f3(i3, o3 + 16), width: f3(i3, o3 + 4), height: f3(i3, o3 + 8) };
          let t4 = s3(i3, o3 + 22);
          t4 = s3(i3, o3 + 20) / (0 == t4 ? 100 : t4);
          const r5 = { rect: e5, delay: Math.round(1e3 * t4), dispose: i3[o3 + 24], blend: i3[o3 + 25] };
          l3.frames.push(r5);
        } else if ("fdAT" == r4) {
          for (g2 = 0; g2 < e4 - 4; g2++) u2[d2 + g2] = i3[o3 + g2 + 4];
          d2 += e4 - 4;
        } else if ("pHYs" == r4) l3.tabs[r4] = [a3.readUint(i3, o3), a3.readUint(i3, o3 + 4), i3[o3 + 8]];
        else if ("cHRM" == r4) {
          l3.tabs[r4] = [];
          for (g2 = 0; g2 < 8; g2++) l3.tabs[r4].push(a3.readUint(i3, o3 + 4 * g2));
        } else if ("tEXt" == r4 || "zTXt" == r4) {
          null == l3.tabs[r4] && (l3.tabs[r4] = {});
          var m2 = a3.nextZero(i3, o3), w2 = a3.readASCII(i3, o3, m2 - o3), v2 = o3 + e4 - m2 - 1;
          if ("tEXt" == r4) y2 = a3.readASCII(i3, m2 + 1, v2);
          else {
            var b2 = _inflate(i3.slice(m2 + 2, m2 + 2 + v2));
            y2 = a3.readUTF8(b2, 0, b2.length);
          }
          l3.tabs[r4][w2] = y2;
        } else if ("iTXt" == r4) {
          null == l3.tabs[r4] && (l3.tabs[r4] = {});
          m2 = 0, p2 = o3;
          m2 = a3.nextZero(i3, p2);
          w2 = a3.readASCII(i3, p2, m2 - p2);
          const t4 = i3[p2 = m2 + 1];
          var y2;
          i3[p2 + 1], p2 += 2, m2 = a3.nextZero(i3, p2), a3.readASCII(i3, p2, m2 - p2), p2 = m2 + 1, m2 = a3.nextZero(i3, p2), a3.readUTF8(i3, p2, m2 - p2);
          v2 = e4 - ((p2 = m2 + 1) - o3);
          if (0 == t4) y2 = a3.readUTF8(i3, p2, v2);
          else {
            b2 = _inflate(i3.slice(p2, p2 + v2));
            y2 = a3.readUTF8(b2, 0, b2.length);
          }
          l3.tabs[r4][w2] = y2;
        } else if ("PLTE" == r4) l3.tabs[r4] = a3.readBytes(i3, o3, e4);
        else if ("hIST" == r4) {
          const e5 = l3.tabs.PLTE.length / 3;
          l3.tabs[r4] = [];
          for (g2 = 0; g2 < e5; g2++) l3.tabs[r4].push(s3(i3, o3 + 2 * g2));
        } else if ("tRNS" == r4) 3 == l3.ctype ? l3.tabs[r4] = a3.readBytes(i3, o3, e4) : 0 == l3.ctype ? l3.tabs[r4] = s3(i3, o3) : 2 == l3.ctype && (l3.tabs[r4] = [s3(i3, o3), s3(i3, o3 + 2), s3(i3, o3 + 4)]);
        else if ("gAMA" == r4) l3.tabs[r4] = a3.readUint(i3, o3) / 1e5;
        else if ("sRGB" == r4) l3.tabs[r4] = i3[o3];
        else if ("bKGD" == r4) 0 == l3.ctype || 4 == l3.ctype ? l3.tabs[r4] = [s3(i3, o3)] : 2 == l3.ctype || 6 == l3.ctype ? l3.tabs[r4] = [s3(i3, o3), s3(i3, o3 + 2), s3(i3, o3 + 4)] : 3 == l3.ctype && (l3.tabs[r4] = i3[o3]);
        else if ("IEND" == r4) break;
        o3 += e4, a3.readUint(i3, o3), o3 += 4;
      }
      var E;
      return 0 != d2 && ((E = l3.frames[l3.frames.length - 1]).data = _decompress(l3, u2.slice(0, d2), E.rect.width, E.rect.height)), l3.data = _decompress(l3, c3, l3.width, l3.height), delete l3.compress, delete l3.interlace, delete l3.filter, l3;
    }, toRGBA8: function toRGBA8(e4) {
      const t4 = e4.width, r3 = e4.height;
      if (null == e4.tabs.acTL) return [decodeImage(e4.data, t4, r3, e4).buffer];
      const i3 = [];
      null == e4.frames[0].data && (e4.frames[0].data = e4.data);
      const o3 = t4 * r3 * 4, a3 = new Uint8Array(o3), s3 = new Uint8Array(o3), f3 = new Uint8Array(o3);
      for (let c3 = 0; c3 < e4.frames.length; c3++) {
        const u2 = e4.frames[c3], h2 = u2.rect.x, d2 = u2.rect.y, A = u2.rect.width, g2 = u2.rect.height, p2 = decodeImage(u2.data, A, g2, e4);
        if (0 != c3) for (var l3 = 0; l3 < o3; l3++) f3[l3] = a3[l3];
        if (0 == u2.blend ? _copyTile(p2, A, g2, a3, t4, r3, h2, d2, 0) : 1 == u2.blend && _copyTile(p2, A, g2, a3, t4, r3, h2, d2, 1), i3.push(a3.buffer.slice(0)), 0 == u2.dispose) ;
        else if (1 == u2.dispose) _copyTile(s3, A, g2, a3, t4, r3, h2, d2, 0);
        else if (2 == u2.dispose) for (l3 = 0; l3 < o3; l3++) a3[l3] = f3[l3];
      }
      return i3;
    }, _paeth, _copyTile, _bin: e3 };
  })();
  !(function() {
    const { _copyTile: e3 } = UPNG, { _bin: t3 } = UPNG, r3 = UPNG._paeth;
    var i3 = { table: (function() {
      const e4 = new Uint32Array(256);
      for (let t4 = 0; t4 < 256; t4++) {
        let r4 = t4;
        for (let e5 = 0; e5 < 8; e5++) 1 & r4 ? r4 = 3988292384 ^ r4 >>> 1 : r4 >>>= 1;
        e4[t4] = r4;
      }
      return e4;
    })(), update(e4, t4, r4, o4) {
      for (let a3 = 0; a3 < o4; a3++) e4 = i3.table[255 & (e4 ^ t4[r4 + a3])] ^ e4 >>> 8;
      return e4;
    }, crc: (e4, t4, r4) => 4294967295 ^ i3.update(4294967295, e4, t4, r4) };
    function addErr(e4, t4, r4, i4) {
      t4[r4] += e4[0] * i4 >> 4, t4[r4 + 1] += e4[1] * i4 >> 4, t4[r4 + 2] += e4[2] * i4 >> 4, t4[r4 + 3] += e4[3] * i4 >> 4;
    }
    function N2(e4) {
      return Math.max(0, Math.min(255, e4));
    }
    function D(e4, t4) {
      const r4 = e4[0] - t4[0], i4 = e4[1] - t4[1], o4 = e4[2] - t4[2], a3 = e4[3] - t4[3];
      return r4 * r4 + i4 * i4 + o4 * o4 + a3 * a3;
    }
    function dither(e4, t4, r4, i4, o4, a3, s3) {
      null == s3 && (s3 = 1);
      const f3 = i4.length, l3 = [];
      for (var c3 = 0; c3 < f3; c3++) {
        const e5 = i4[c3];
        l3.push([e5 >>> 0 & 255, e5 >>> 8 & 255, e5 >>> 16 & 255, e5 >>> 24 & 255]);
      }
      for (c3 = 0; c3 < f3; c3++) {
        let e5 = 4294967295;
        for (var u2 = 0, h2 = 0; h2 < f3; h2++) {
          var d2 = D(l3[c3], l3[h2]);
          h2 != c3 && d2 < e5 && (e5 = d2, u2 = h2);
        }
      }
      const A = new Uint32Array(o4.buffer), g2 = new Int16Array(t4 * r4 * 4), p2 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
      for (c3 = 0; c3 < p2.length; c3++) p2[c3] = 255 * ((p2[c3] + 0.5) / 16 - 0.5);
      for (let o5 = 0; o5 < r4; o5++) for (let w2 = 0; w2 < t4; w2++) {
        var m2;
        c3 = 4 * (o5 * t4 + w2);
        if (2 != s3) m2 = [N2(e4[c3] + g2[c3]), N2(e4[c3 + 1] + g2[c3 + 1]), N2(e4[c3 + 2] + g2[c3 + 2]), N2(e4[c3 + 3] + g2[c3 + 3])];
        else {
          d2 = p2[4 * (3 & o5) + (3 & w2)];
          m2 = [N2(e4[c3] + d2), N2(e4[c3 + 1] + d2), N2(e4[c3 + 2] + d2), N2(e4[c3 + 3] + d2)];
        }
        u2 = 0;
        let v2 = 16777215;
        for (h2 = 0; h2 < f3; h2++) {
          const e5 = D(m2, l3[h2]);
          e5 < v2 && (v2 = e5, u2 = h2);
        }
        const b2 = l3[u2], y2 = [m2[0] - b2[0], m2[1] - b2[1], m2[2] - b2[2], m2[3] - b2[3]];
        1 == s3 && (w2 != t4 - 1 && addErr(y2, g2, c3 + 4, 7), o5 != r4 - 1 && (0 != w2 && addErr(y2, g2, c3 + 4 * t4 - 4, 3), addErr(y2, g2, c3 + 4 * t4, 5), w2 != t4 - 1 && addErr(y2, g2, c3 + 4 * t4 + 4, 1))), a3[c3 >> 2] = u2, A[c3 >> 2] = i4[u2];
      }
    }
    function _main(e4, r4, o4, a3, s3) {
      null == s3 && (s3 = {});
      const { crc: f3 } = i3, l3 = t3.writeUint, c3 = t3.writeUshort, u2 = t3.writeASCII;
      let h2 = 8;
      const d2 = e4.frames.length > 1;
      let A, g2 = false, p2 = 33 + (d2 ? 20 : 0);
      if (null != s3.sRGB && (p2 += 13), null != s3.pHYs && (p2 += 21), null != s3.iCCP && (A = pako.deflate(s3.iCCP), p2 += 21 + A.length + 4), 3 == e4.ctype) {
        for (var m2 = e4.plte.length, w2 = 0; w2 < m2; w2++) e4.plte[w2] >>> 24 != 255 && (g2 = true);
        p2 += 8 + 3 * m2 + 4 + (g2 ? 8 + 1 * m2 + 4 : 0);
      }
      for (var v2 = 0; v2 < e4.frames.length; v2++) {
        d2 && (p2 += 38), p2 += (F = e4.frames[v2]).cimg.length + 12, 0 != v2 && (p2 += 4);
      }
      p2 += 12;
      const b2 = new Uint8Array(p2), y2 = [137, 80, 78, 71, 13, 10, 26, 10];
      for (w2 = 0; w2 < 8; w2++) b2[w2] = y2[w2];
      if (l3(b2, h2, 13), h2 += 4, u2(b2, h2, "IHDR"), h2 += 4, l3(b2, h2, r4), h2 += 4, l3(b2, h2, o4), h2 += 4, b2[h2] = e4.depth, h2++, b2[h2] = e4.ctype, h2++, b2[h2] = 0, h2++, b2[h2] = 0, h2++, b2[h2] = 0, h2++, l3(b2, h2, f3(b2, h2 - 17, 17)), h2 += 4, null != s3.sRGB && (l3(b2, h2, 1), h2 += 4, u2(b2, h2, "sRGB"), h2 += 4, b2[h2] = s3.sRGB, h2++, l3(b2, h2, f3(b2, h2 - 5, 5)), h2 += 4), null != s3.iCCP) {
        const e5 = 13 + A.length;
        l3(b2, h2, e5), h2 += 4, u2(b2, h2, "iCCP"), h2 += 4, u2(b2, h2, "ICC profile"), h2 += 11, h2 += 2, b2.set(A, h2), h2 += A.length, l3(b2, h2, f3(b2, h2 - (e5 + 4), e5 + 4)), h2 += 4;
      }
      if (null != s3.pHYs && (l3(b2, h2, 9), h2 += 4, u2(b2, h2, "pHYs"), h2 += 4, l3(b2, h2, s3.pHYs[0]), h2 += 4, l3(b2, h2, s3.pHYs[1]), h2 += 4, b2[h2] = s3.pHYs[2], h2++, l3(b2, h2, f3(b2, h2 - 13, 13)), h2 += 4), d2 && (l3(b2, h2, 8), h2 += 4, u2(b2, h2, "acTL"), h2 += 4, l3(b2, h2, e4.frames.length), h2 += 4, l3(b2, h2, null != s3.loop ? s3.loop : 0), h2 += 4, l3(b2, h2, f3(b2, h2 - 12, 12)), h2 += 4), 3 == e4.ctype) {
        l3(b2, h2, 3 * (m2 = e4.plte.length)), h2 += 4, u2(b2, h2, "PLTE"), h2 += 4;
        for (w2 = 0; w2 < m2; w2++) {
          const t4 = 3 * w2, r5 = e4.plte[w2], i4 = 255 & r5, o5 = r5 >>> 8 & 255, a4 = r5 >>> 16 & 255;
          b2[h2 + t4 + 0] = i4, b2[h2 + t4 + 1] = o5, b2[h2 + t4 + 2] = a4;
        }
        if (h2 += 3 * m2, l3(b2, h2, f3(b2, h2 - 3 * m2 - 4, 3 * m2 + 4)), h2 += 4, g2) {
          l3(b2, h2, m2), h2 += 4, u2(b2, h2, "tRNS"), h2 += 4;
          for (w2 = 0; w2 < m2; w2++) b2[h2 + w2] = e4.plte[w2] >>> 24 & 255;
          h2 += m2, l3(b2, h2, f3(b2, h2 - m2 - 4, m2 + 4)), h2 += 4;
        }
      }
      let E = 0;
      for (v2 = 0; v2 < e4.frames.length; v2++) {
        var F = e4.frames[v2];
        d2 && (l3(b2, h2, 26), h2 += 4, u2(b2, h2, "fcTL"), h2 += 4, l3(b2, h2, E++), h2 += 4, l3(b2, h2, F.rect.width), h2 += 4, l3(b2, h2, F.rect.height), h2 += 4, l3(b2, h2, F.rect.x), h2 += 4, l3(b2, h2, F.rect.y), h2 += 4, c3(b2, h2, a3[v2]), h2 += 2, c3(b2, h2, 1e3), h2 += 2, b2[h2] = F.dispose, h2++, b2[h2] = F.blend, h2++, l3(b2, h2, f3(b2, h2 - 30, 30)), h2 += 4);
        const t4 = F.cimg;
        l3(b2, h2, (m2 = t4.length) + (0 == v2 ? 0 : 4)), h2 += 4;
        const r5 = h2;
        u2(b2, h2, 0 == v2 ? "IDAT" : "fdAT"), h2 += 4, 0 != v2 && (l3(b2, h2, E++), h2 += 4), b2.set(t4, h2), h2 += m2, l3(b2, h2, f3(b2, r5, h2 - r5)), h2 += 4;
      }
      return l3(b2, h2, 0), h2 += 4, u2(b2, h2, "IEND"), h2 += 4, l3(b2, h2, f3(b2, h2 - 4, 4)), h2 += 4, b2.buffer;
    }
    function compressPNG(e4, t4, r4) {
      for (let i4 = 0; i4 < e4.frames.length; i4++) {
        const o4 = e4.frames[i4];
        o4.rect.width;
        const a3 = o4.rect.height, s3 = new Uint8Array(a3 * o4.bpl + a3);
        o4.cimg = _filterZero(o4.img, a3, o4.bpp, o4.bpl, s3, t4, r4);
      }
    }
    function compress2(t4, r4, i4, o4, a3) {
      const s3 = a3[0], f3 = a3[1], l3 = a3[2], c3 = a3[3], u2 = a3[4], h2 = a3[5];
      let d2 = 6, A = 8, g2 = 255;
      for (var p2 = 0; p2 < t4.length; p2++) {
        const e4 = new Uint8Array(t4[p2]);
        for (var m2 = e4.length, w2 = 0; w2 < m2; w2 += 4) g2 &= e4[w2 + 3];
      }
      const v2 = 255 != g2, b2 = (function framize(t5, r5, i5, o5, a4, s4) {
        const f4 = [];
        for (var l4 = 0; l4 < t5.length; l4++) {
          const h4 = new Uint8Array(t5[l4]), A3 = new Uint32Array(h4.buffer);
          var c4;
          let g3 = 0, p3 = 0, m3 = r5, w3 = i5, v3 = o5 ? 1 : 0;
          if (0 != l4) {
            const b3 = s4 || o5 || 1 == l4 || 0 != f4[l4 - 2].dispose ? 1 : 2;
            let y3 = 0, E2 = 1e9;
            for (let e4 = 0; e4 < b3; e4++) {
              var u3 = new Uint8Array(t5[l4 - 1 - e4]);
              const o6 = new Uint32Array(t5[l4 - 1 - e4]);
              let s5 = r5, f5 = i5, c5 = -1, h5 = -1;
              for (let e5 = 0; e5 < i5; e5++) for (let t6 = 0; t6 < r5; t6++) {
                A3[d3 = e5 * r5 + t6] != o6[d3] && (t6 < s5 && (s5 = t6), t6 > c5 && (c5 = t6), e5 < f5 && (f5 = e5), e5 > h5 && (h5 = e5));
              }
              -1 == c5 && (s5 = f5 = c5 = h5 = 0), a4 && (1 == (1 & s5) && s5--, 1 == (1 & f5) && f5--);
              const v4 = (c5 - s5 + 1) * (h5 - f5 + 1);
              v4 < E2 && (E2 = v4, y3 = e4, g3 = s5, p3 = f5, m3 = c5 - s5 + 1, w3 = h5 - f5 + 1);
            }
            u3 = new Uint8Array(t5[l4 - 1 - y3]);
            1 == y3 && (f4[l4 - 1].dispose = 2), c4 = new Uint8Array(m3 * w3 * 4), e3(u3, r5, i5, c4, m3, w3, -g3, -p3, 0), v3 = e3(h4, r5, i5, c4, m3, w3, -g3, -p3, 3) ? 1 : 0, 1 == v3 ? _prepareDiff(h4, r5, i5, c4, { x: g3, y: p3, width: m3, height: w3 }) : e3(h4, r5, i5, c4, m3, w3, -g3, -p3, 0);
          } else c4 = h4.slice(0);
          f4.push({ rect: { x: g3, y: p3, width: m3, height: w3 }, img: c4, blend: v3, dispose: 0 });
        }
        if (o5) for (l4 = 0; l4 < f4.length; l4++) {
          if (1 == (A2 = f4[l4]).blend) continue;
          const e4 = A2.rect, o6 = f4[l4 - 1].rect, s5 = Math.min(e4.x, o6.x), c5 = Math.min(e4.y, o6.y), u4 = { x: s5, y: c5, width: Math.max(e4.x + e4.width, o6.x + o6.width) - s5, height: Math.max(e4.y + e4.height, o6.y + o6.height) - c5 };
          f4[l4 - 1].dispose = 1, l4 - 1 != 0 && _updateFrame(t5, r5, i5, f4, l4 - 1, u4, a4), _updateFrame(t5, r5, i5, f4, l4, u4, a4);
        }
        let h3 = 0;
        if (1 != t5.length) for (var d3 = 0; d3 < f4.length; d3++) {
          var A2;
          h3 += (A2 = f4[d3]).rect.width * A2.rect.height;
        }
        return f4;
      })(t4, r4, i4, s3, f3, l3), y2 = {}, E = [], F = [];
      if (0 != o4) {
        const e4 = [];
        for (w2 = 0; w2 < b2.length; w2++) e4.push(b2[w2].img.buffer);
        const t5 = (function concatRGBA(e5) {
          let t6 = 0;
          for (var r6 = 0; r6 < e5.length; r6++) t6 += e5[r6].byteLength;
          const i6 = new Uint8Array(t6);
          let o5 = 0;
          for (r6 = 0; r6 < e5.length; r6++) {
            const t7 = new Uint8Array(e5[r6]), a4 = t7.length;
            for (let e6 = 0; e6 < a4; e6 += 4) {
              let r7 = t7[e6], a5 = t7[e6 + 1], s4 = t7[e6 + 2];
              const f4 = t7[e6 + 3];
              0 == f4 && (r7 = a5 = s4 = 0), i6[o5 + e6] = r7, i6[o5 + e6 + 1] = a5, i6[o5 + e6 + 2] = s4, i6[o5 + e6 + 3] = f4;
            }
            o5 += a4;
          }
          return i6.buffer;
        })(e4), r5 = quantize(t5, o4);
        for (w2 = 0; w2 < r5.plte.length; w2++) E.push(r5.plte[w2].est.rgba);
        let i5 = 0;
        for (w2 = 0; w2 < b2.length; w2++) {
          const e5 = (B = b2[w2]).img.length;
          var _ = new Uint8Array(r5.inds.buffer, i5 >> 2, e5 >> 2);
          F.push(_);
          const t6 = new Uint8Array(r5.abuf, i5, e5);
          h2 && dither(B.img, B.rect.width, B.rect.height, E, t6, _), B.img.set(t6), i5 += e5;
        }
      } else for (p2 = 0; p2 < b2.length; p2++) {
        var B = b2[p2];
        const e4 = new Uint32Array(B.img.buffer);
        var U = B.rect.width;
        m2 = e4.length, _ = new Uint8Array(m2);
        F.push(_);
        for (w2 = 0; w2 < m2; w2++) {
          const t5 = e4[w2];
          if (0 != w2 && t5 == e4[w2 - 1]) _[w2] = _[w2 - 1];
          else if (w2 > U && t5 == e4[w2 - U]) _[w2] = _[w2 - U];
          else {
            let e5 = y2[t5];
            if (null == e5 && (y2[t5] = e5 = E.length, E.push(t5), E.length >= 300)) break;
            _[w2] = e5;
          }
        }
      }
      const C = E.length;
      C <= 256 && 0 == u2 && (A = C <= 2 ? 1 : C <= 4 ? 2 : C <= 16 ? 4 : 8, A = Math.max(A, c3));
      for (p2 = 0; p2 < b2.length; p2++) {
        (B = b2[p2]).rect.x, B.rect.y;
        U = B.rect.width;
        const e4 = B.rect.height;
        let t5 = B.img;
        new Uint32Array(t5.buffer);
        let r5 = 4 * U, i5 = 4;
        if (C <= 256 && 0 == u2) {
          r5 = Math.ceil(A * U / 8);
          var I = new Uint8Array(r5 * e4);
          const o5 = F[p2];
          for (let t6 = 0; t6 < e4; t6++) {
            w2 = t6 * r5;
            const e5 = t6 * U;
            if (8 == A) for (var Q = 0; Q < U; Q++) I[w2 + Q] = o5[e5 + Q];
            else if (4 == A) for (Q = 0; Q < U; Q++) I[w2 + (Q >> 1)] |= o5[e5 + Q] << 4 - 4 * (1 & Q);
            else if (2 == A) for (Q = 0; Q < U; Q++) I[w2 + (Q >> 2)] |= o5[e5 + Q] << 6 - 2 * (3 & Q);
            else if (1 == A) for (Q = 0; Q < U; Q++) I[w2 + (Q >> 3)] |= o5[e5 + Q] << 7 - 1 * (7 & Q);
          }
          t5 = I, d2 = 3, i5 = 1;
        } else if (0 == v2 && 1 == b2.length) {
          I = new Uint8Array(U * e4 * 3);
          const o5 = U * e4;
          for (w2 = 0; w2 < o5; w2++) {
            const e5 = 3 * w2, r6 = 4 * w2;
            I[e5] = t5[r6], I[e5 + 1] = t5[r6 + 1], I[e5 + 2] = t5[r6 + 2];
          }
          t5 = I, d2 = 2, i5 = 3, r5 = 3 * U;
        }
        B.img = t5, B.bpl = r5, B.bpp = i5;
      }
      return { ctype: d2, depth: A, plte: E, frames: b2 };
    }
    function _updateFrame(t4, r4, i4, o4, a3, s3, f3) {
      const l3 = Uint8Array, c3 = Uint32Array, u2 = new l3(t4[a3 - 1]), h2 = new c3(t4[a3 - 1]), d2 = a3 + 1 < t4.length ? new l3(t4[a3 + 1]) : null, A = new l3(t4[a3]), g2 = new c3(A.buffer);
      let p2 = r4, m2 = i4, w2 = -1, v2 = -1;
      for (let e4 = 0; e4 < s3.height; e4++) for (let t5 = 0; t5 < s3.width; t5++) {
        const i5 = s3.x + t5, f4 = s3.y + e4, l4 = f4 * r4 + i5, c4 = g2[l4];
        0 == c4 || 0 == o4[a3 - 1].dispose && h2[l4] == c4 && (null == d2 || 0 != d2[4 * l4 + 3]) || (i5 < p2 && (p2 = i5), i5 > w2 && (w2 = i5), f4 < m2 && (m2 = f4), f4 > v2 && (v2 = f4));
      }
      -1 == w2 && (p2 = m2 = w2 = v2 = 0), f3 && (1 == (1 & p2) && p2--, 1 == (1 & m2) && m2--), s3 = { x: p2, y: m2, width: w2 - p2 + 1, height: v2 - m2 + 1 };
      const b2 = o4[a3];
      b2.rect = s3, b2.blend = 1, b2.img = new Uint8Array(s3.width * s3.height * 4), 0 == o4[a3 - 1].dispose ? (e3(u2, r4, i4, b2.img, s3.width, s3.height, -s3.x, -s3.y, 0), _prepareDiff(A, r4, i4, b2.img, s3)) : e3(A, r4, i4, b2.img, s3.width, s3.height, -s3.x, -s3.y, 0);
    }
    function _prepareDiff(t4, r4, i4, o4, a3) {
      e3(t4, r4, i4, o4, a3.width, a3.height, -a3.x, -a3.y, 2);
    }
    function _filterZero(e4, t4, r4, i4, o4, a3, s3) {
      const f3 = [];
      let l3, c3 = [0, 1, 2, 3, 4];
      -1 != a3 ? c3 = [a3] : (t4 * i4 > 5e5 || 1 == r4) && (c3 = [0]), s3 && (l3 = { level: 0 });
      const u2 = UZIP;
      for (var h2 = 0; h2 < c3.length; h2++) {
        for (let a4 = 0; a4 < t4; a4++) _filterLine(o4, e4, a4, i4, r4, c3[h2]);
        f3.push(u2.deflate(o4, l3));
      }
      let d2, A = 1e9;
      for (h2 = 0; h2 < f3.length; h2++) f3[h2].length < A && (d2 = h2, A = f3[h2].length);
      return f3[d2];
    }
    function _filterLine(e4, t4, i4, o4, a3, s3) {
      const f3 = i4 * o4;
      let l3 = f3 + i4;
      if (e4[l3] = s3, l3++, 0 == s3) if (o4 < 500) for (var c3 = 0; c3 < o4; c3++) e4[l3 + c3] = t4[f3 + c3];
      else e4.set(new Uint8Array(t4.buffer, f3, o4), l3);
      else if (1 == s3) {
        for (c3 = 0; c3 < a3; c3++) e4[l3 + c3] = t4[f3 + c3];
        for (c3 = a3; c3 < o4; c3++) e4[l3 + c3] = t4[f3 + c3] - t4[f3 + c3 - a3] + 256 & 255;
      } else if (0 == i4) {
        for (c3 = 0; c3 < a3; c3++) e4[l3 + c3] = t4[f3 + c3];
        if (2 == s3) for (c3 = a3; c3 < o4; c3++) e4[l3 + c3] = t4[f3 + c3];
        if (3 == s3) for (c3 = a3; c3 < o4; c3++) e4[l3 + c3] = t4[f3 + c3] - (t4[f3 + c3 - a3] >> 1) + 256 & 255;
        if (4 == s3) for (c3 = a3; c3 < o4; c3++) e4[l3 + c3] = t4[f3 + c3] - r3(t4[f3 + c3 - a3], 0, 0) + 256 & 255;
      } else {
        if (2 == s3) for (c3 = 0; c3 < o4; c3++) e4[l3 + c3] = t4[f3 + c3] + 256 - t4[f3 + c3 - o4] & 255;
        if (3 == s3) {
          for (c3 = 0; c3 < a3; c3++) e4[l3 + c3] = t4[f3 + c3] + 256 - (t4[f3 + c3 - o4] >> 1) & 255;
          for (c3 = a3; c3 < o4; c3++) e4[l3 + c3] = t4[f3 + c3] + 256 - (t4[f3 + c3 - o4] + t4[f3 + c3 - a3] >> 1) & 255;
        }
        if (4 == s3) {
          for (c3 = 0; c3 < a3; c3++) e4[l3 + c3] = t4[f3 + c3] + 256 - r3(0, t4[f3 + c3 - o4], 0) & 255;
          for (c3 = a3; c3 < o4; c3++) e4[l3 + c3] = t4[f3 + c3] + 256 - r3(t4[f3 + c3 - a3], t4[f3 + c3 - o4], t4[f3 + c3 - a3 - o4]) & 255;
        }
      }
    }
    function quantize(e4, t4) {
      const r4 = new Uint8Array(e4), i4 = r4.slice(0), o4 = new Uint32Array(i4.buffer), a3 = getKDtree(i4, t4), s3 = a3[0], f3 = a3[1], l3 = r4.length, c3 = new Uint8Array(l3 >> 2);
      let u2;
      if (r4.length < 2e7) for (var h2 = 0; h2 < l3; h2 += 4) {
        u2 = getNearest(s3, d2 = r4[h2] * (1 / 255), A = r4[h2 + 1] * (1 / 255), g2 = r4[h2 + 2] * (1 / 255), p2 = r4[h2 + 3] * (1 / 255)), c3[h2 >> 2] = u2.ind, o4[h2 >> 2] = u2.est.rgba;
      }
      else for (h2 = 0; h2 < l3; h2 += 4) {
        var d2 = r4[h2] * (1 / 255), A = r4[h2 + 1] * (1 / 255), g2 = r4[h2 + 2] * (1 / 255), p2 = r4[h2 + 3] * (1 / 255);
        for (u2 = s3; u2.left; ) u2 = planeDst(u2.est, d2, A, g2, p2) <= 0 ? u2.left : u2.right;
        c3[h2 >> 2] = u2.ind, o4[h2 >> 2] = u2.est.rgba;
      }
      return { abuf: i4.buffer, inds: c3, plte: f3 };
    }
    function getKDtree(e4, t4, r4) {
      null == r4 && (r4 = 1e-4);
      const i4 = new Uint32Array(e4.buffer), o4 = { i0: 0, i1: e4.length, bst: null, est: null, tdst: 0, left: null, right: null };
      o4.bst = stats(e4, o4.i0, o4.i1), o4.est = estats(o4.bst);
      const a3 = [o4];
      for (; a3.length < t4; ) {
        let t5 = 0, o5 = 0;
        for (var s3 = 0; s3 < a3.length; s3++) a3[s3].est.L > t5 && (t5 = a3[s3].est.L, o5 = s3);
        if (t5 < r4) break;
        const f3 = a3[o5], l3 = splitPixels(e4, i4, f3.i0, f3.i1, f3.est.e, f3.est.eMq255);
        if (f3.i0 >= l3 || f3.i1 <= l3) {
          f3.est.L = 0;
          continue;
        }
        const c3 = { i0: f3.i0, i1: l3, bst: null, est: null, tdst: 0, left: null, right: null };
        c3.bst = stats(e4, c3.i0, c3.i1), c3.est = estats(c3.bst);
        const u2 = { i0: l3, i1: f3.i1, bst: null, est: null, tdst: 0, left: null, right: null };
        u2.bst = { R: [], m: [], N: f3.bst.N - c3.bst.N };
        for (s3 = 0; s3 < 16; s3++) u2.bst.R[s3] = f3.bst.R[s3] - c3.bst.R[s3];
        for (s3 = 0; s3 < 4; s3++) u2.bst.m[s3] = f3.bst.m[s3] - c3.bst.m[s3];
        u2.est = estats(u2.bst), f3.left = c3, f3.right = u2, a3[o5] = c3, a3.push(u2);
      }
      a3.sort(((e5, t5) => t5.bst.N - e5.bst.N));
      for (s3 = 0; s3 < a3.length; s3++) a3[s3].ind = s3;
      return [o4, a3];
    }
    function getNearest(e4, t4, r4, i4, o4) {
      if (null == e4.left) return e4.tdst = (function dist(e5, t5, r5, i5, o5) {
        const a4 = t5 - e5[0], s4 = r5 - e5[1], f4 = i5 - e5[2], l4 = o5 - e5[3];
        return a4 * a4 + s4 * s4 + f4 * f4 + l4 * l4;
      })(e4.est.q, t4, r4, i4, o4), e4;
      const a3 = planeDst(e4.est, t4, r4, i4, o4);
      let s3 = e4.left, f3 = e4.right;
      a3 > 0 && (s3 = e4.right, f3 = e4.left);
      const l3 = getNearest(s3, t4, r4, i4, o4);
      if (l3.tdst <= a3 * a3) return l3;
      const c3 = getNearest(f3, t4, r4, i4, o4);
      return c3.tdst < l3.tdst ? c3 : l3;
    }
    function planeDst(e4, t4, r4, i4, o4) {
      const { e: a3 } = e4;
      return a3[0] * t4 + a3[1] * r4 + a3[2] * i4 + a3[3] * o4 - e4.eMq;
    }
    function splitPixels(e4, t4, r4, i4, o4, a3) {
      for (i4 -= 4; r4 < i4; ) {
        for (; vecDot(e4, r4, o4) <= a3; ) r4 += 4;
        for (; vecDot(e4, i4, o4) > a3; ) i4 -= 4;
        if (r4 >= i4) break;
        const s3 = t4[r4 >> 2];
        t4[r4 >> 2] = t4[i4 >> 2], t4[i4 >> 2] = s3, r4 += 4, i4 -= 4;
      }
      for (; vecDot(e4, r4, o4) > a3; ) r4 -= 4;
      return r4 + 4;
    }
    function vecDot(e4, t4, r4) {
      return e4[t4] * r4[0] + e4[t4 + 1] * r4[1] + e4[t4 + 2] * r4[2] + e4[t4 + 3] * r4[3];
    }
    function stats(e4, t4, r4) {
      const i4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], o4 = [0, 0, 0, 0], a3 = r4 - t4 >> 2;
      for (let a4 = t4; a4 < r4; a4 += 4) {
        const t5 = e4[a4] * (1 / 255), r5 = e4[a4 + 1] * (1 / 255), s3 = e4[a4 + 2] * (1 / 255), f3 = e4[a4 + 3] * (1 / 255);
        o4[0] += t5, o4[1] += r5, o4[2] += s3, o4[3] += f3, i4[0] += t5 * t5, i4[1] += t5 * r5, i4[2] += t5 * s3, i4[3] += t5 * f3, i4[5] += r5 * r5, i4[6] += r5 * s3, i4[7] += r5 * f3, i4[10] += s3 * s3, i4[11] += s3 * f3, i4[15] += f3 * f3;
      }
      return i4[4] = i4[1], i4[8] = i4[2], i4[9] = i4[6], i4[12] = i4[3], i4[13] = i4[7], i4[14] = i4[11], { R: i4, m: o4, N: a3 };
    }
    function estats(e4) {
      const { R: t4 } = e4, { m: r4 } = e4, { N: i4 } = e4, a3 = r4[0], s3 = r4[1], f3 = r4[2], l3 = r4[3], c3 = 0 == i4 ? 0 : 1 / i4, u2 = [t4[0] - a3 * a3 * c3, t4[1] - a3 * s3 * c3, t4[2] - a3 * f3 * c3, t4[3] - a3 * l3 * c3, t4[4] - s3 * a3 * c3, t4[5] - s3 * s3 * c3, t4[6] - s3 * f3 * c3, t4[7] - s3 * l3 * c3, t4[8] - f3 * a3 * c3, t4[9] - f3 * s3 * c3, t4[10] - f3 * f3 * c3, t4[11] - f3 * l3 * c3, t4[12] - l3 * a3 * c3, t4[13] - l3 * s3 * c3, t4[14] - l3 * f3 * c3, t4[15] - l3 * l3 * c3], h2 = u2, d2 = o3;
      let A = [Math.random(), Math.random(), Math.random(), Math.random()], g2 = 0, p2 = 0;
      if (0 != i4) for (let e5 = 0; e5 < 16 && (A = d2.multVec(h2, A), p2 = Math.sqrt(d2.dot(A, A)), A = d2.sml(1 / p2, A), !(0 != e5 && Math.abs(p2 - g2) < 1e-9)); e5++) g2 = p2;
      const m2 = [a3 * c3, s3 * c3, f3 * c3, l3 * c3];
      return { Cov: u2, q: m2, e: A, L: g2, eMq255: d2.dot(d2.sml(255, m2), A), eMq: d2.dot(A, m2), rgba: (Math.round(255 * m2[3]) << 24 | Math.round(255 * m2[2]) << 16 | Math.round(255 * m2[1]) << 8 | Math.round(255 * m2[0]) << 0) >>> 0 };
    }
    var o3 = { multVec: (e4, t4) => [e4[0] * t4[0] + e4[1] * t4[1] + e4[2] * t4[2] + e4[3] * t4[3], e4[4] * t4[0] + e4[5] * t4[1] + e4[6] * t4[2] + e4[7] * t4[3], e4[8] * t4[0] + e4[9] * t4[1] + e4[10] * t4[2] + e4[11] * t4[3], e4[12] * t4[0] + e4[13] * t4[1] + e4[14] * t4[2] + e4[15] * t4[3]], dot: (e4, t4) => e4[0] * t4[0] + e4[1] * t4[1] + e4[2] * t4[2] + e4[3] * t4[3], sml: (e4, t4) => [e4 * t4[0], e4 * t4[1], e4 * t4[2], e4 * t4[3]] };
    UPNG.encode = function encode(e4, t4, r4, i4, o4, a3, s3) {
      null == i4 && (i4 = 0), null == s3 && (s3 = false);
      const f3 = compress2(e4, t4, r4, i4, [false, false, false, 0, s3, false]);
      return compressPNG(f3, -1), _main(f3, t4, r4, o4, a3);
    }, UPNG.encodeLL = function encodeLL(e4, t4, r4, i4, o4, a3, s3, f3) {
      const l3 = { ctype: 0 + (1 == i4 ? 0 : 2) + (0 == o4 ? 0 : 4), depth: a3, frames: [] }, c3 = (i4 + o4) * a3, u2 = c3 * t4;
      for (let i5 = 0; i5 < e4.length; i5++) l3.frames.push({ rect: { x: 0, y: 0, width: t4, height: r4 }, img: new Uint8Array(e4[i5]), blend: 0, dispose: 1, bpp: Math.ceil(c3 / 8), bpl: Math.ceil(u2 / 8) });
      return compressPNG(l3, 0, true), _main(l3, t4, r4, s3, f3);
    }, UPNG.encode.compress = compress2, UPNG.encode.dither = dither, UPNG.quantize = quantize, UPNG.quantize.getKDtree = getKDtree, UPNG.quantize.getNearest = getNearest;
  })();
  var r = { toArrayBuffer(e3, t3) {
    const i3 = e3.width, o3 = e3.height, a3 = i3 << 2, s3 = e3.getContext("2d").getImageData(0, 0, i3, o3), f3 = new Uint32Array(s3.data.buffer), l3 = (32 * i3 + 31) / 32 << 2, c3 = l3 * o3, u2 = 122 + c3, h2 = new ArrayBuffer(u2), d2 = new DataView(h2), A = 1 << 20;
    let g2, p2, m2, w2, v2 = A, b2 = 0, y2 = 0, E = 0;
    function set16(e4) {
      d2.setUint16(y2, e4, true), y2 += 2;
    }
    function set32(e4) {
      d2.setUint32(y2, e4, true), y2 += 4;
    }
    function seek(e4) {
      y2 += e4;
    }
    set16(19778), set32(u2), seek(4), set32(122), set32(108), set32(i3), set32(-o3 >>> 0), set16(1), set16(32), set32(3), set32(c3), set32(2835), set32(2835), seek(8), set32(16711680), set32(65280), set32(255), set32(4278190080), set32(1466527264), (function convert() {
      for (; b2 < o3 && v2 > 0; ) {
        for (w2 = 122 + b2 * l3, g2 = 0; g2 < a3; ) v2--, p2 = f3[E++], m2 = p2 >>> 24, d2.setUint32(w2 + g2, p2 << 8 | m2), g2 += 4;
        b2++;
      }
      E < f3.length ? (v2 = A, setTimeout(convert, r._dly)) : t3(h2);
    })();
  }, toBlob(e3, t3) {
    this.toArrayBuffer(e3, ((e4) => {
      t3(new Blob([e4], { type: "image/bmp" }));
    }));
  }, _dly: 9 };
  var i = { CHROME: "CHROME", FIREFOX: "FIREFOX", DESKTOP_SAFARI: "DESKTOP_SAFARI", IE: "IE", IOS: "IOS", ETC: "ETC" };
  var o = { [i.CHROME]: 16384, [i.FIREFOX]: 11180, [i.DESKTOP_SAFARI]: 16384, [i.IE]: 8192, [i.IOS]: 4096, [i.ETC]: 8192 };
  var a = "undefined" != typeof window;
  var s = "undefined" != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope;
  var f = a && window.cordova && window.cordova.require && window.cordova.require("cordova/modulemapper");
  var CustomFile = (a || s) && (f && f.getOriginalSymbol(window, "File") || "undefined" != typeof File && File);
  var CustomFileReader = (a || s) && (f && f.getOriginalSymbol(window, "FileReader") || "undefined" != typeof FileReader && FileReader);
  function getFilefromDataUrl(e3, t3, r3 = Date.now()) {
    return new Promise(((i3) => {
      const o3 = e3.split(","), a3 = o3[0].match(/:(.*?);/)[1], s3 = globalThis.atob(o3[1]);
      let f3 = s3.length;
      const l3 = new Uint8Array(f3);
      for (; f3--; ) l3[f3] = s3.charCodeAt(f3);
      const c3 = new Blob([l3], { type: a3 });
      c3.name = t3, c3.lastModified = r3, i3(c3);
    }));
  }
  function getDataUrlFromFile(e3) {
    return new Promise(((t3, r3) => {
      const i3 = new CustomFileReader();
      i3.onload = () => t3(i3.result), i3.onerror = (e4) => r3(e4), i3.readAsDataURL(e3);
    }));
  }
  function loadImage(e3) {
    return new Promise(((t3, r3) => {
      const i3 = new Image();
      i3.onload = () => t3(i3), i3.onerror = (e4) => r3(e4), i3.src = e3;
    }));
  }
  function getBrowserName() {
    if (void 0 !== getBrowserName.cachedResult) return getBrowserName.cachedResult;
    let e3 = i.ETC;
    const { userAgent: t3 } = navigator;
    return /Chrom(e|ium)/i.test(t3) ? e3 = i.CHROME : /iP(ad|od|hone)/i.test(t3) && /WebKit/i.test(t3) ? e3 = i.IOS : /Safari/i.test(t3) ? e3 = i.DESKTOP_SAFARI : /Firefox/i.test(t3) ? e3 = i.FIREFOX : (/MSIE/i.test(t3) || true == !!document.documentMode) && (e3 = i.IE), getBrowserName.cachedResult = e3, getBrowserName.cachedResult;
  }
  function approximateBelowMaximumCanvasSizeOfBrowser(e3, t3) {
    const r3 = getBrowserName(), i3 = o[r3];
    let a3 = e3, s3 = t3, f3 = a3 * s3;
    const l3 = a3 > s3 ? s3 / a3 : a3 / s3;
    for (; f3 > i3 * i3; ) {
      const e4 = (i3 + a3) / 2, t4 = (i3 + s3) / 2;
      e4 < t4 ? (s3 = t4, a3 = t4 * l3) : (s3 = e4 * l3, a3 = e4), f3 = a3 * s3;
    }
    return { width: a3, height: s3 };
  }
  function getNewCanvasAndCtx(e3, t3) {
    let r3, i3;
    try {
      if (r3 = new OffscreenCanvas(e3, t3), i3 = r3.getContext("2d"), null === i3) throw new Error("getContext of OffscreenCanvas returns null");
    } catch (e4) {
      r3 = document.createElement("canvas"), i3 = r3.getContext("2d");
    }
    return r3.width = e3, r3.height = t3, [r3, i3];
  }
  function drawImageInCanvas(e3, t3) {
    const { width: r3, height: i3 } = approximateBelowMaximumCanvasSizeOfBrowser(e3.width, e3.height), [o3, a3] = getNewCanvasAndCtx(r3, i3);
    return t3 && /jpe?g/.test(t3) && (a3.fillStyle = "white", a3.fillRect(0, 0, o3.width, o3.height)), a3.drawImage(e3, 0, 0, o3.width, o3.height), o3;
  }
  function isIOS() {
    return void 0 !== isIOS.cachedResult || (isIOS.cachedResult = ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(navigator.platform) || navigator.userAgent.includes("Mac") && "undefined" != typeof document && "ontouchend" in document), isIOS.cachedResult;
  }
  function drawFileInCanvas(e3, t3 = {}) {
    return new Promise((function(r3, o3) {
      let a3, s3;
      var $Try_2_Post = function() {
        try {
          return s3 = drawImageInCanvas(a3, t3.fileType || e3.type), r3([a3, s3]);
        } catch (e4) {
          return o3(e4);
        }
      }, $Try_2_Catch = function(t4) {
        try {
          0;
          var $Try_3_Catch = function(e4) {
            try {
              throw e4;
            } catch (e5) {
              return o3(e5);
            }
          };
          try {
            let t5;
            return getDataUrlFromFile(e3).then((function(e4) {
              try {
                return t5 = e4, loadImage(t5).then((function(e5) {
                  try {
                    return a3 = e5, (function() {
                      try {
                        return $Try_2_Post();
                      } catch (e6) {
                        return o3(e6);
                      }
                    })();
                  } catch (e6) {
                    return $Try_3_Catch(e6);
                  }
                }), $Try_3_Catch);
              } catch (e5) {
                return $Try_3_Catch(e5);
              }
            }), $Try_3_Catch);
          } catch (e4) {
            $Try_3_Catch(e4);
          }
        } catch (e4) {
          return o3(e4);
        }
      };
      try {
        if (isIOS() || [i.DESKTOP_SAFARI, i.MOBILE_SAFARI].includes(getBrowserName())) throw new Error("Skip createImageBitmap on IOS and Safari");
        return createImageBitmap(e3).then((function(e4) {
          try {
            return a3 = e4, $Try_2_Post();
          } catch (e5) {
            return $Try_2_Catch();
          }
        }), $Try_2_Catch);
      } catch (e4) {
        $Try_2_Catch();
      }
    }));
  }
  function canvasToFile(e3, t3, i3, o3, a3 = 1) {
    return new Promise((function(s3, f3) {
      let l3;
      if ("image/png" === t3) {
        let c3, u2, h2;
        return c3 = e3.getContext("2d"), { data: u2 } = c3.getImageData(0, 0, e3.width, e3.height), h2 = UPNG.encode([u2.buffer], e3.width, e3.height, 4096 * a3), l3 = new Blob([h2], { type: t3 }), l3.name = i3, l3.lastModified = o3, $If_4.call(this);
      }
      {
        let $If_5 = function() {
          return $If_4.call(this);
        };
        if ("image/bmp" === t3) return new Promise(((t4) => r.toBlob(e3, t4))).then(function(e4) {
          try {
            return l3 = e4, l3.name = i3, l3.lastModified = o3, $If_5.call(this);
          } catch (e5) {
            return f3(e5);
          }
        }.bind(this), f3);
        {
          let $If_6 = function() {
            return $If_5.call(this);
          };
          if ("function" == typeof OffscreenCanvas && e3 instanceof OffscreenCanvas) return e3.convertToBlob({ type: t3, quality: a3 }).then(function(e4) {
            try {
              return l3 = e4, l3.name = i3, l3.lastModified = o3, $If_6.call(this);
            } catch (e5) {
              return f3(e5);
            }
          }.bind(this), f3);
          {
            let d2;
            return d2 = e3.toDataURL(t3, a3), getFilefromDataUrl(d2, i3, o3).then(function(e4) {
              try {
                return l3 = e4, $If_6.call(this);
              } catch (e5) {
                return f3(e5);
              }
            }.bind(this), f3);
          }
        }
      }
      function $If_4() {
        return s3(l3);
      }
    }));
  }
  function cleanupCanvasMemory(e3) {
    e3.width = 0, e3.height = 0;
  }
  function isAutoOrientationInBrowser() {
    return new Promise((function(e3, t3) {
      let r3, i3, o3, a3, s3;
      return void 0 !== isAutoOrientationInBrowser.cachedResult ? e3(isAutoOrientationInBrowser.cachedResult) : (r3 = "data:image/jpeg;base64,/9j/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAYAAAAAAAD/2wCEAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/AABEIAAEAAgMBEQACEQEDEQH/xABKAAEAAAAAAAAAAAAAAAAAAAALEAEAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAAAAAAAAAAAAAAAEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8H//2Q==", getFilefromDataUrl("data:image/jpeg;base64,/9j/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAYAAAAAAAD/2wCEAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/AABEIAAEAAgMBEQACEQEDEQH/xABKAAEAAAAAAAAAAAAAAAAAAAALEAEAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAAAAAAAAAAAAAAAEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8H//2Q==", "test.jpg", Date.now()).then((function(r4) {
        try {
          return i3 = r4, drawFileInCanvas(i3).then((function(r5) {
            try {
              return o3 = r5[1], canvasToFile(o3, i3.type, i3.name, i3.lastModified).then((function(r6) {
                try {
                  return a3 = r6, cleanupCanvasMemory(o3), drawFileInCanvas(a3).then((function(r7) {
                    try {
                      return s3 = r7[0], isAutoOrientationInBrowser.cachedResult = 1 === s3.width && 2 === s3.height, e3(isAutoOrientationInBrowser.cachedResult);
                    } catch (e4) {
                      return t3(e4);
                    }
                  }), t3);
                } catch (e4) {
                  return t3(e4);
                }
              }), t3);
            } catch (e4) {
              return t3(e4);
            }
          }), t3);
        } catch (e4) {
          return t3(e4);
        }
      }), t3));
    }));
  }
  function getExifOrientation(e3) {
    return new Promise(((t3, r3) => {
      const i3 = new CustomFileReader();
      i3.onload = (e4) => {
        const r4 = new DataView(e4.target.result);
        if (65496 != r4.getUint16(0, false)) return t3(-2);
        const i4 = r4.byteLength;
        let o3 = 2;
        for (; o3 < i4; ) {
          if (r4.getUint16(o3 + 2, false) <= 8) return t3(-1);
          const e5 = r4.getUint16(o3, false);
          if (o3 += 2, 65505 == e5) {
            if (1165519206 != r4.getUint32(o3 += 2, false)) return t3(-1);
            const e6 = 18761 == r4.getUint16(o3 += 6, false);
            o3 += r4.getUint32(o3 + 4, e6);
            const i5 = r4.getUint16(o3, e6);
            o3 += 2;
            for (let a3 = 0; a3 < i5; a3++) if (274 == r4.getUint16(o3 + 12 * a3, e6)) return t3(r4.getUint16(o3 + 12 * a3 + 8, e6));
          } else {
            if (65280 != (65280 & e5)) break;
            o3 += r4.getUint16(o3, false);
          }
        }
        return t3(-1);
      }, i3.onerror = (e4) => r3(e4), i3.readAsArrayBuffer(e3);
    }));
  }
  function handleMaxWidthOrHeight(e3, t3) {
    const { width: r3 } = e3, { height: i3 } = e3, { maxWidthOrHeight: o3 } = t3;
    let a3, s3 = e3;
    return isFinite(o3) && (r3 > o3 || i3 > o3) && ([s3, a3] = getNewCanvasAndCtx(r3, i3), r3 > i3 ? (s3.width = o3, s3.height = i3 / r3 * o3) : (s3.width = r3 / i3 * o3, s3.height = o3), a3.drawImage(e3, 0, 0, s3.width, s3.height), cleanupCanvasMemory(e3)), s3;
  }
  function followExifOrientation(e3, t3) {
    const { width: r3 } = e3, { height: i3 } = e3, [o3, a3] = getNewCanvasAndCtx(r3, i3);
    switch (t3 > 4 && t3 < 9 ? (o3.width = i3, o3.height = r3) : (o3.width = r3, o3.height = i3), t3) {
      case 2:
        a3.transform(-1, 0, 0, 1, r3, 0);
        break;
      case 3:
        a3.transform(-1, 0, 0, -1, r3, i3);
        break;
      case 4:
        a3.transform(1, 0, 0, -1, 0, i3);
        break;
      case 5:
        a3.transform(0, 1, 1, 0, 0, 0);
        break;
      case 6:
        a3.transform(0, 1, -1, 0, i3, 0);
        break;
      case 7:
        a3.transform(0, -1, -1, 0, i3, r3);
        break;
      case 8:
        a3.transform(0, -1, 1, 0, 0, r3);
    }
    return a3.drawImage(e3, 0, 0, r3, i3), cleanupCanvasMemory(e3), o3;
  }
  function compress(e3, t3, r3 = 0) {
    return new Promise((function(i3, o3) {
      let a3, s3, f3, l3, c3, u2, h2, d2, A, g2, p2, m2, w2, v2, b2, y2, E, F, _, B;
      function incProgress(e4 = 5) {
        if (t3.signal && t3.signal.aborted) throw t3.signal.reason;
        a3 += e4, t3.onProgress(Math.min(a3, 100));
      }
      function setProgress(e4) {
        if (t3.signal && t3.signal.aborted) throw t3.signal.reason;
        a3 = Math.min(Math.max(e4, a3), 100), t3.onProgress(a3);
      }
      return a3 = r3, s3 = t3.maxIteration || 10, f3 = 1024 * t3.maxSizeMB * 1024, incProgress(), drawFileInCanvas(e3, t3).then(function(r4) {
        try {
          return [, l3] = r4, incProgress(), c3 = handleMaxWidthOrHeight(l3, t3), incProgress(), new Promise((function(r5, i4) {
            var o4;
            if (!(o4 = t3.exifOrientation)) return getExifOrientation(e3).then(function(e4) {
              try {
                return o4 = e4, $If_2.call(this);
              } catch (e5) {
                return i4(e5);
              }
            }.bind(this), i4);
            function $If_2() {
              return r5(o4);
            }
            return $If_2.call(this);
          })).then(function(r5) {
            try {
              return u2 = r5, incProgress(), isAutoOrientationInBrowser().then(function(r6) {
                try {
                  return h2 = r6 ? c3 : followExifOrientation(c3, u2), incProgress(), d2 = t3.initialQuality || 1, A = t3.fileType || e3.type, canvasToFile(h2, A, e3.name, e3.lastModified, d2).then(function(r7) {
                    try {
                      {
                        let $Loop_3 = function() {
                          if (s3-- && (b2 > f3 || b2 > w2)) {
                            let t4, r8;
                            return t4 = B ? 0.95 * _.width : _.width, r8 = B ? 0.95 * _.height : _.height, [E, F] = getNewCanvasAndCtx(t4, r8), F.drawImage(_, 0, 0, t4, r8), d2 *= "image/png" === A ? 0.85 : 0.95, canvasToFile(E, A, e3.name, e3.lastModified, d2).then((function(e4) {
                              try {
                                return y2 = e4, cleanupCanvasMemory(_), _ = E, b2 = y2.size, setProgress(Math.min(99, Math.floor((v2 - b2) / (v2 - f3) * 100))), $Loop_3;
                              } catch (e5) {
                                return o3(e5);
                              }
                            }), o3);
                          }
                          return [1];
                        }, $Loop_3_exit = function() {
                          return cleanupCanvasMemory(_), cleanupCanvasMemory(E), cleanupCanvasMemory(c3), cleanupCanvasMemory(h2), cleanupCanvasMemory(l3), setProgress(100), i3(y2);
                        };
                        if (g2 = r7, incProgress(), p2 = g2.size > f3, m2 = g2.size > e3.size, !p2 && !m2) return setProgress(100), i3(g2);
                        var a4;
                        return w2 = e3.size, v2 = g2.size, b2 = v2, _ = h2, B = !t3.alwaysKeepResolution && p2, (a4 = function(e4) {
                          for (; e4; ) {
                            if (e4.then) return void e4.then(a4, o3);
                            try {
                              if (e4.pop) {
                                if (e4.length) return e4.pop() ? $Loop_3_exit.call(this) : e4;
                                e4 = $Loop_3;
                              } else e4 = e4.call(this);
                            } catch (e5) {
                              return o3(e5);
                            }
                          }
                        }.bind(this))($Loop_3);
                      }
                    } catch (u3) {
                      return o3(u3);
                    }
                  }.bind(this), o3);
                } catch (e4) {
                  return o3(e4);
                }
              }.bind(this), o3);
            } catch (e4) {
              return o3(e4);
            }
          }.bind(this), o3);
        } catch (e4) {
          return o3(e4);
        }
      }.bind(this), o3);
    }));
  }
  var l = "\nlet scriptImported = false\nself.addEventListener('message', async (e) => {\n  const { file, id, imageCompressionLibUrl, options } = e.data\n  options.onProgress = (progress) => self.postMessage({ progress, id })\n  try {\n    if (!scriptImported) {\n      // console.log('[worker] importScripts', imageCompressionLibUrl)\n      self.importScripts(imageCompressionLibUrl)\n      scriptImported = true\n    }\n    // console.log('[worker] self', self)\n    const compressedFile = await imageCompression(file, options)\n    self.postMessage({ file: compressedFile, id })\n  } catch (e) {\n    // console.error('[worker] error', e)\n    self.postMessage({ error: e.message + '\\n' + e.stack, id })\n  }\n})\n";
  var c;
  function compressOnWebWorker(e3, t3) {
    return new Promise(((r3, i3) => {
      c || (c = (function createWorkerScriptURL(e4) {
        const t4 = [];
        return "function" == typeof e4 ? t4.push(`(${e4})()`) : t4.push(e4), URL.createObjectURL(new Blob(t4));
      })(l));
      const o3 = new Worker(c);
      o3.addEventListener("message", (function handler(e4) {
        if (t3.signal && t3.signal.aborted) o3.terminate();
        else if (void 0 === e4.data.progress) {
          if (e4.data.error) return i3(new Error(e4.data.error)), void o3.terminate();
          r3(e4.data.file), o3.terminate();
        } else t3.onProgress(e4.data.progress);
      })), o3.addEventListener("error", i3), t3.signal && t3.signal.addEventListener("abort", (() => {
        i3(t3.signal.reason), o3.terminate();
      })), o3.postMessage({ file: e3, imageCompressionLibUrl: t3.libURL, options: { ...t3, onProgress: void 0, signal: void 0 } });
    }));
  }
  function imageCompression(e3, t3) {
    return new Promise((function(r3, i3) {
      let o3, a3, s3, f3, l3, c3;
      if (o3 = { ...t3 }, s3 = 0, { onProgress: f3 } = o3, o3.maxSizeMB = o3.maxSizeMB || Number.POSITIVE_INFINITY, l3 = "boolean" != typeof o3.useWebWorker || o3.useWebWorker, delete o3.useWebWorker, o3.onProgress = (e4) => {
        s3 = e4, "function" == typeof f3 && f3(s3);
      }, !(e3 instanceof Blob || e3 instanceof CustomFile)) return i3(new Error("The file given is not an instance of Blob or File"));
      if (!/^image/.test(e3.type)) return i3(new Error("The file given is not an image"));
      if (c3 = "undefined" != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope, !l3 || "function" != typeof Worker || c3) return compress(e3, o3).then(function(e4) {
        try {
          return a3 = e4, $If_4.call(this);
        } catch (e5) {
          return i3(e5);
        }
      }.bind(this), i3);
      var u2 = function() {
        try {
          return $If_4.call(this);
        } catch (e4) {
          return i3(e4);
        }
      }.bind(this), $Try_1_Catch = function(t4) {
        try {
          return compress(e3, o3).then((function(e4) {
            try {
              return a3 = e4, u2();
            } catch (e5) {
              return i3(e5);
            }
          }), i3);
        } catch (e4) {
          return i3(e4);
        }
      };
      try {
        return o3.libURL = o3.libURL || "https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.2/dist/browser-image-compression.js", compressOnWebWorker(e3, o3).then((function(e4) {
          try {
            return a3 = e4, u2();
          } catch (e5) {
            return $Try_1_Catch();
          }
        }), $Try_1_Catch);
      } catch (e4) {
        $Try_1_Catch();
      }
      function $If_4() {
        try {
          a3.name = e3.name, a3.lastModified = e3.lastModified;
        } catch (e4) {
        }
        try {
          o3.preserveExif && "image/jpeg" === e3.type && (!o3.fileType || o3.fileType && o3.fileType === e3.type) && (a3 = copyExifWithoutOrientation(e3, a3));
        } catch (e4) {
        }
        return r3(a3);
      }
    }));
  }
  imageCompression.getDataUrlFromFile = getDataUrlFromFile, imageCompression.getFilefromDataUrl = getFilefromDataUrl, imageCompression.loadImage = loadImage, imageCompression.drawImageInCanvas = drawImageInCanvas, imageCompression.drawFileInCanvas = drawFileInCanvas, imageCompression.canvasToFile = canvasToFile, imageCompression.getExifOrientation = getExifOrientation, imageCompression.handleMaxWidthOrHeight = handleMaxWidthOrHeight, imageCompression.followExifOrientation = followExifOrientation, imageCompression.cleanupCanvasMemory = cleanupCanvasMemory, imageCompression.isAutoOrientationInBrowser = isAutoOrientationInBrowser, imageCompression.approximateBelowMaximumCanvasSizeOfBrowser = approximateBelowMaximumCanvasSizeOfBrowser, imageCompression.copyExifWithoutOrientation = copyExifWithoutOrientation, imageCompression.getBrowserName = getBrowserName, imageCompression.version = "2.0.2";

  // src/common/utils.ts
  var browser;
  if (browser == void 0) {
    browser = chrome;
  }
  function getByPath(object, path) {
    if (!path) {
      return object;
    }
    let ob = object;
    for (let node of path.split(".")) {
      ob = ob[node];
      if (ob === void 0) {
        throw `getByPath: ${node} did not exist in path ${path}`;
      }
    }
    return ob;
  }
  function setByPath(object, path, value) {
    let ob = object;
    const pathSplit = path.split(".");
    for (let i3 = 0; i3 < pathSplit.length - 1; i3++) {
      ob = ob[pathSplit[i3]];
      if (ob === void 0) {
        throw `setByPath: ${pathSplit[i3]} did not exist in path ${path}`;
      }
    }
    ob[pathSplit[pathSplit.length - 1]] = value;
  }
  function fillObjectWithDefaults(object, defaults) {
    if (!object) {
      object = {};
    }
    for (const key of Object.keys(defaults)) {
      if (typeof defaults[key] === "object" && !Array.isArray(defaults[key]) && defaults[key] !== null) {
        object[key] = fillObjectWithDefaults(object[key], defaults[key]);
      }
      if (object[key] === void 0) {
        object[key] = defaults[key];
      }
    }
    return object;
  }
  var FNV_PRIME = 0x0100000001b3n;
  var FNV_OFFSET = 0xcbf29ce484222325n;
  function fnv1aHash(byteArray) {
    let hash = FNV_OFFSET;
    for (let i3 = 0; i3 < byteArray.length; i3++) {
      hash ^= BigInt(byteArray[i3]);
      hash = BigInt.asUintN(64, hash * FNV_PRIME);
    }
    return hash.toString();
  }

  // src/background-scripts/api-background-script.ts
  async function fetchWeatherData(location) {
    const apiKey = "2b6f9b6dbe5064dd770f29d4b229a22c";
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching Weather data:", error);
      return {
        cod: 69,
        message: "error code for internal use"
      };
    }
  }
  async function fetchDelijnData(apiUrl) {
    const apiKey = "ddb68605719d4bb8b6444b6871cefc7a";
    try {
      const response = await fetch(apiUrl, {
        headers: { "Ocp-Apim-Subscription-Key": apiKey }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching Delijn data:", error);
    }
  }
  async function fetchIRailData(apiUrl) {
    try {
      const url = new URL(apiUrl);
      if (url.protocol !== "https:" || url.hostname !== "api.irail.be") {
        throw new Error("Invalid iRail URL");
      }
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching iRail data:", error);
      return null;
    }
  }

  // src/background-scripts/json-loader.ts
  async function loadJSON(path) {
    const url = browser.runtime.getURL(path);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${path}`);
    }
    return await response.json();
  }

  // node_modules/colord/index.mjs
  var r2 = { grad: 0.9, turn: 360, rad: 360 / (2 * Math.PI) };
  var t2 = function(r3) {
    return "string" == typeof r3 ? r3.length > 0 : "number" == typeof r3;
  };
  var n = function(r3, t3, n2) {
    return void 0 === t3 && (t3 = 0), void 0 === n2 && (n2 = Math.pow(10, t3)), Math.round(n2 * r3) / n2 + 0;
  };
  var e2 = function(r3, t3, n2) {
    return void 0 === t3 && (t3 = 0), void 0 === n2 && (n2 = 1), r3 > n2 ? n2 : r3 > t3 ? r3 : t3;
  };
  var u = function(r3) {
    return (r3 = isFinite(r3) ? r3 % 360 : 0) > 0 ? r3 : r3 + 360;
  };
  var a2 = function(r3) {
    return { r: e2(r3.r, 0, 255), g: e2(r3.g, 0, 255), b: e2(r3.b, 0, 255), a: e2(r3.a) };
  };
  var o2 = function(r3) {
    return { r: n(r3.r), g: n(r3.g), b: n(r3.b), a: n(r3.a, 3) };
  };
  var i2 = /^#([0-9a-f]{3,8})$/i;
  var s2 = function(r3) {
    var t3 = r3.toString(16);
    return t3.length < 2 ? "0" + t3 : t3;
  };
  var h = function(r3) {
    var t3 = r3.r, n2 = r3.g, e3 = r3.b, u2 = r3.a, a3 = Math.max(t3, n2, e3), o3 = a3 - Math.min(t3, n2, e3), i3 = o3 ? a3 === t3 ? (n2 - e3) / o3 : a3 === n2 ? 2 + (e3 - t3) / o3 : 4 + (t3 - n2) / o3 : 0;
    return { h: 60 * (i3 < 0 ? i3 + 6 : i3), s: a3 ? o3 / a3 * 100 : 0, v: a3 / 255 * 100, a: u2 };
  };
  var b = function(r3) {
    var t3 = r3.h, n2 = r3.s, e3 = r3.v, u2 = r3.a;
    t3 = t3 / 360 * 6, n2 /= 100, e3 /= 100;
    var a3 = Math.floor(t3), o3 = e3 * (1 - n2), i3 = e3 * (1 - (t3 - a3) * n2), s3 = e3 * (1 - (1 - t3 + a3) * n2), h2 = a3 % 6;
    return { r: 255 * [e3, i3, o3, o3, s3, e3][h2], g: 255 * [s3, e3, e3, i3, o3, o3][h2], b: 255 * [o3, o3, s3, e3, e3, i3][h2], a: u2 };
  };
  var g = function(r3) {
    return { h: u(r3.h), s: e2(r3.s, 0, 100), l: e2(r3.l, 0, 100), a: e2(r3.a) };
  };
  var d = function(r3) {
    return { h: n(r3.h), s: n(r3.s), l: n(r3.l), a: n(r3.a, 3) };
  };
  var f2 = function(r3) {
    return b((n2 = (t3 = r3).s, { h: t3.h, s: (n2 *= ((e3 = t3.l) < 50 ? e3 : 100 - e3) / 100) > 0 ? 2 * n2 / (e3 + n2) * 100 : 0, v: e3 + n2, a: t3.a }));
    var t3, n2, e3;
  };
  var c2 = function(r3) {
    return { h: (t3 = h(r3)).h, s: (u2 = (200 - (n2 = t3.s)) * (e3 = t3.v) / 100) > 0 && u2 < 200 ? n2 * e3 / 100 / (u2 <= 100 ? u2 : 200 - u2) * 100 : 0, l: u2 / 2, a: t3.a };
    var t3, n2, e3, u2;
  };
  var l2 = /^hsla?\(\s*([+-]?\d*\.?\d+)(deg|rad|grad|turn)?\s*,\s*([+-]?\d*\.?\d+)%\s*,\s*([+-]?\d*\.?\d+)%\s*(?:,\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;
  var p = /^hsla?\(\s*([+-]?\d*\.?\d+)(deg|rad|grad|turn)?\s+([+-]?\d*\.?\d+)%\s+([+-]?\d*\.?\d+)%\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;
  var v = /^rgba?\(\s*([+-]?\d*\.?\d+)(%)?\s*,\s*([+-]?\d*\.?\d+)(%)?\s*,\s*([+-]?\d*\.?\d+)(%)?\s*(?:,\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;
  var m = /^rgba?\(\s*([+-]?\d*\.?\d+)(%)?\s+([+-]?\d*\.?\d+)(%)?\s+([+-]?\d*\.?\d+)(%)?\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;
  var y = { string: [[function(r3) {
    var t3 = i2.exec(r3);
    return t3 ? (r3 = t3[1]).length <= 4 ? { r: parseInt(r3[0] + r3[0], 16), g: parseInt(r3[1] + r3[1], 16), b: parseInt(r3[2] + r3[2], 16), a: 4 === r3.length ? n(parseInt(r3[3] + r3[3], 16) / 255, 2) : 1 } : 6 === r3.length || 8 === r3.length ? { r: parseInt(r3.substr(0, 2), 16), g: parseInt(r3.substr(2, 2), 16), b: parseInt(r3.substr(4, 2), 16), a: 8 === r3.length ? n(parseInt(r3.substr(6, 2), 16) / 255, 2) : 1 } : null : null;
  }, "hex"], [function(r3) {
    var t3 = v.exec(r3) || m.exec(r3);
    return t3 ? t3[2] !== t3[4] || t3[4] !== t3[6] ? null : a2({ r: Number(t3[1]) / (t3[2] ? 100 / 255 : 1), g: Number(t3[3]) / (t3[4] ? 100 / 255 : 1), b: Number(t3[5]) / (t3[6] ? 100 / 255 : 1), a: void 0 === t3[7] ? 1 : Number(t3[7]) / (t3[8] ? 100 : 1) }) : null;
  }, "rgb"], [function(t3) {
    var n2 = l2.exec(t3) || p.exec(t3);
    if (!n2) return null;
    var e3, u2, a3 = g({ h: (e3 = n2[1], u2 = n2[2], void 0 === u2 && (u2 = "deg"), Number(e3) * (r2[u2] || 1)), s: Number(n2[3]), l: Number(n2[4]), a: void 0 === n2[5] ? 1 : Number(n2[5]) / (n2[6] ? 100 : 1) });
    return f2(a3);
  }, "hsl"]], object: [[function(r3) {
    var n2 = r3.r, e3 = r3.g, u2 = r3.b, o3 = r3.a, i3 = void 0 === o3 ? 1 : o3;
    return t2(n2) && t2(e3) && t2(u2) ? a2({ r: Number(n2), g: Number(e3), b: Number(u2), a: Number(i3) }) : null;
  }, "rgb"], [function(r3) {
    var n2 = r3.h, e3 = r3.s, u2 = r3.l, a3 = r3.a, o3 = void 0 === a3 ? 1 : a3;
    if (!t2(n2) || !t2(e3) || !t2(u2)) return null;
    var i3 = g({ h: Number(n2), s: Number(e3), l: Number(u2), a: Number(o3) });
    return f2(i3);
  }, "hsl"], [function(r3) {
    var n2 = r3.h, a3 = r3.s, o3 = r3.v, i3 = r3.a, s3 = void 0 === i3 ? 1 : i3;
    if (!t2(n2) || !t2(a3) || !t2(o3)) return null;
    var h2 = (function(r4) {
      return { h: u(r4.h), s: e2(r4.s, 0, 100), v: e2(r4.v, 0, 100), a: e2(r4.a) };
    })({ h: Number(n2), s: Number(a3), v: Number(o3), a: Number(s3) });
    return b(h2);
  }, "hsv"]] };
  var N = function(r3, t3) {
    for (var n2 = 0; n2 < t3.length; n2++) {
      var e3 = t3[n2][0](r3);
      if (e3) return [e3, t3[n2][1]];
    }
    return [null, void 0];
  };
  var x = function(r3) {
    return "string" == typeof r3 ? N(r3.trim(), y.string) : "object" == typeof r3 && null !== r3 ? N(r3, y.object) : [null, void 0];
  };
  var M = function(r3, t3) {
    var n2 = c2(r3);
    return { h: n2.h, s: e2(n2.s + 100 * t3, 0, 100), l: n2.l, a: n2.a };
  };
  var H = function(r3) {
    return (299 * r3.r + 587 * r3.g + 114 * r3.b) / 1e3 / 255;
  };
  var $ = function(r3, t3) {
    var n2 = c2(r3);
    return { h: n2.h, s: n2.s, l: e2(n2.l + 100 * t3, 0, 100), a: n2.a };
  };
  var j = (function() {
    function r3(r4) {
      this.parsed = x(r4)[0], this.rgba = this.parsed || { r: 0, g: 0, b: 0, a: 1 };
    }
    return r3.prototype.isValid = function() {
      return null !== this.parsed;
    }, r3.prototype.brightness = function() {
      return n(H(this.rgba), 2);
    }, r3.prototype.isDark = function() {
      return H(this.rgba) < 0.5;
    }, r3.prototype.isLight = function() {
      return H(this.rgba) >= 0.5;
    }, r3.prototype.toHex = function() {
      return r4 = o2(this.rgba), t3 = r4.r, e3 = r4.g, u2 = r4.b, i3 = (a3 = r4.a) < 1 ? s2(n(255 * a3)) : "", "#" + s2(t3) + s2(e3) + s2(u2) + i3;
      var r4, t3, e3, u2, a3, i3;
    }, r3.prototype.toRgb = function() {
      return o2(this.rgba);
    }, r3.prototype.toRgbString = function() {
      return r4 = o2(this.rgba), t3 = r4.r, n2 = r4.g, e3 = r4.b, (u2 = r4.a) < 1 ? "rgba(" + t3 + ", " + n2 + ", " + e3 + ", " + u2 + ")" : "rgb(" + t3 + ", " + n2 + ", " + e3 + ")";
      var r4, t3, n2, e3, u2;
    }, r3.prototype.toHsl = function() {
      return d(c2(this.rgba));
    }, r3.prototype.toHslString = function() {
      return r4 = d(c2(this.rgba)), t3 = r4.h, n2 = r4.s, e3 = r4.l, (u2 = r4.a) < 1 ? "hsla(" + t3 + ", " + n2 + "%, " + e3 + "%, " + u2 + ")" : "hsl(" + t3 + ", " + n2 + "%, " + e3 + "%)";
      var r4, t3, n2, e3, u2;
    }, r3.prototype.toHsv = function() {
      return r4 = h(this.rgba), { h: n(r4.h), s: n(r4.s), v: n(r4.v), a: n(r4.a, 3) };
      var r4;
    }, r3.prototype.invert = function() {
      return w({ r: 255 - (r4 = this.rgba).r, g: 255 - r4.g, b: 255 - r4.b, a: r4.a });
      var r4;
    }, r3.prototype.saturate = function(r4) {
      return void 0 === r4 && (r4 = 0.1), w(M(this.rgba, r4));
    }, r3.prototype.desaturate = function(r4) {
      return void 0 === r4 && (r4 = 0.1), w(M(this.rgba, -r4));
    }, r3.prototype.grayscale = function() {
      return w(M(this.rgba, -1));
    }, r3.prototype.lighten = function(r4) {
      return void 0 === r4 && (r4 = 0.1), w($(this.rgba, r4));
    }, r3.prototype.darken = function(r4) {
      return void 0 === r4 && (r4 = 0.1), w($(this.rgba, -r4));
    }, r3.prototype.rotate = function(r4) {
      return void 0 === r4 && (r4 = 15), this.hue(this.hue() + r4);
    }, r3.prototype.alpha = function(r4) {
      return "number" == typeof r4 ? w({ r: (t3 = this.rgba).r, g: t3.g, b: t3.b, a: r4 }) : n(this.rgba.a, 3);
      var t3;
    }, r3.prototype.hue = function(r4) {
      var t3 = c2(this.rgba);
      return "number" == typeof r4 ? w({ h: r4, s: t3.s, l: t3.l, a: t3.a }) : n(t3.h);
    }, r3.prototype.isEqual = function(r4) {
      return this.toHex() === w(r4).toHex();
    }, r3;
  })();
  var w = function(r3) {
    return r3 instanceof j ? r3 : new j(r3);
  };

  // src/common/theme-file.ts
  var MAX_THEME_FILE_SIZE = 20 * 1024 * 1024;
  var colorKeys = [
    "--color-accent",
    "--color-text",
    "--color-base00",
    "--color-base01",
    "--color-base02",
    "--color-base03",
    "--color-homepage-sidebars-bg",
    "--color-splashtext",
    "--darken-background"
  ];
  function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
  function validateThemeFile(value) {
    if (!isRecord(value) || value["format"] !== "smpp-theme" || value["version"] !== 1) {
      throw new Error("Unsupported theme file or version.");
    }
    const theme = value["theme"];
    if (!isRecord(theme) || typeof theme["displayName"] !== "string" || !theme["displayName"].trim() || theme["displayName"].length > 200 || !isRecord(theme["cssProperties"])) {
      throw new Error("Invalid theme name or colors.");
    }
    const colors = theme["cssProperties"];
    if (Object.keys(colors).some((key) => !colorKeys.includes(key))) {
      throw new Error("This theme contains unsupported color settings.");
    }
    const cssProperties = {};
    for (const key of colorKeys) {
      const color = colors[key];
      if (typeof color !== "string" || color.length > 100 || !w(color).isValid()) {
        throw new Error("The theme contains missing or invalid colors.");
      }
      cssProperties[key] = color;
    }
    let background = null;
    if (value["background"] !== null) {
      const image = value["background"];
      if (!isRecord(image) || typeof image["imageData"] !== "string" || image["imageData"].length > MAX_THEME_FILE_SIZE || !/^data:image\/(png|jpeg|webp|gif|avif|bmp|x-icon);base64,[A-Za-z0-9+/]+={0,2}$/.test(
        image["imageData"]
      )) {
        throw new Error("The background must be an embedded image.");
      }
      background = {
        metaData: { type: "file", link: "Imported background" },
        imageData: image["imageData"]
      };
    }
    return {
      format: "smpp-theme",
      version: 1,
      theme: { displayName: theme["displayName"].trim(), cssProperties },
      background
    };
  }

  // src/background-scripts/themes.ts
  var nativeThemes;
  var categories;
  async function getAllThemes() {
    if (!nativeThemes) {
      nativeThemes = await loadJSON(
        "background-scripts/data/themes.json"
      );
    }
    let customThemes = await getAllCustomThemes();
    let themes = { ...nativeThemes, ...customThemes };
    return themes;
  }
  async function getThemeCategories(includeHidden = false) {
    let allCategories = await getAllThemeCategories();
    if (!includeHidden) {
      const { hidden, ...rest } = allCategories;
      allCategories = rest;
    }
    return allCategories;
  }
  async function getAllThemeCategories() {
    if (!categories) {
      categories = await loadJSON(
        "background-scripts/data/theme-categories.json"
      );
    }
    categories["quickSettings"] = await getQuickSettingsThemes();
    categories["custom"] = await getCustomCategory();
    return categories;
  }
  async function getFirstThemeInCategory(category, includeHidden) {
    let themeNames = await getThemeCategory(category);
    if (!themeNames) {
      return "error";
    }
    if (!includeHidden) {
      let hiddenThemeKeys = await getThemeCategory("hidden");
      themeNames = themeNames.filter(
        (themeKey) => !hiddenThemeKeys.includes(themeKey)
      );
    }
    if (!themeNames[0]) return "error";
    return themeNames[0];
  }
  async function getQuickSettingsThemes() {
    let data = await getSettingsData();
    return data.appearance.quickSettingsThemes;
  }
  async function getThemeCategory(category) {
    let categories2 = await getAllThemeCategories();
    return categories2[category];
  }
  async function getThemes(categorynames = ["all"], includeHidden = false, mustMatchAllCategories = false) {
    let themes = await getAllThemes();
    if (categorynames.includes("all")) return themes;
    const categories2 = await Promise.all(
      categorynames.map(
        (category) => getThemeCategory(category)
      )
    );
    const allThemeNames = categories2.flat();
    let allowedThemeNames;
    if (mustMatchAllCategories) {
      allowedThemeNames = allThemeNames.filter(
        (themeName) => categories2.every((cat) => cat.includes(themeName))
      );
    } else {
      allowedThemeNames = allThemeNames;
    }
    if (!includeHidden) {
      let hiddenThemeKeys = await getThemeCategory("hidden");
      allowedThemeNames = allowedThemeNames.filter(
        (themeKey) => !hiddenThemeKeys.includes(themeKey)
      );
    }
    const filteredThemes = Object.fromEntries(
      Object.entries(themes).filter(([key]) => allowedThemeNames.includes(key))
    );
    return filteredThemes;
  }
  async function getTheme(name) {
    let allThemes = await getAllThemes();
    let theme = allThemes[name];
    if (theme != void 0) {
      return theme;
    } else {
      console.error(`Invalid theme requested:"${name}", sent "error" theme`);
      return allThemes["error"];
    }
  }
  async function getSharedThemeId(shareId) {
    const cache = await loadThemeShareCache();
    for (let [theme, themeShareId] of Object.entries(cache)) {
      if (themeShareId === shareId) {
        return theme;
      }
    }
    return null;
  }
  async function getSharedTheme(shareId) {
    const id = await getSharedThemeId(shareId);
    if (!id) {
      return null;
    }
    return await getTheme(id);
  }
  async function getAllCustomThemes() {
    const result = await browser.storage.local.get("customThemes");
    return result.customThemes || {};
  }
  async function getCustomCategory() {
    const customThemes = await getAllCustomThemes();
    let customCategory = Object.keys(customThemes);
    return customCategory;
  }
  async function saveCustomTheme(data, id = void 0) {
    if (id === void 0) id = crypto.randomUUID();
    const customThemes = await getAllCustomThemes();
    customThemes[id] = data;
    await browser.storage.local.set({ customThemes });
    return id;
  }
  async function importThemeFile(input) {
    const file = validateThemeFile(input);
    const id = crypto.randomUUID();
    const customThemes = await getAllCustomThemes();
    customThemes[id] = file.theme;
    const update = { customThemes };
    if (file.background) {
      const images = (await browser.storage.local.get("images")).images || {};
      images[id] = file.background.metaData;
      update["images"] = images;
      update["SMPPImage-" + id] = file.background.imageData;
    }
    await browser.storage.local.set(update);
    return id;
  }
  async function removeCustomTheme(id) {
    await purgeThemeShareCache(id);
    const customThemes = await getAllCustomThemes();
    delete customThemes[id];
    await removeImage(id);
    await removeImage("compressed-" + id);
    let data = await getSettingsData();
    let quickSettingsThemes = data.appearance.quickSettingsThemes.filter(
      (name) => {
        return name != id;
      }
    );
    setByPath(data, "appearance.quickSettingsThemes", quickSettingsThemes);
    await setSettingsData(data);
    await browser.storage.local.set({ customThemes });
  }
  async function installTheme(shareId) {
    const resp = await fetch("https://theme.smpp.be/" + shareId, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const json = await resp.json();
    const theme = {
      displayName: json.name,
      cssProperties: json.css
    };
    let id = await saveCustomTheme(theme);
    await updateThemeShareCache(id, shareId);
    const settingsData = await getSettingsData();
    settingsData.appearance.theme = id;
    await setSettingsData(settingsData);
    if (json.img_url) {
      const resp2 = await fetch(json.img_url);
      let filename = "ImportedFile.webp";
      if (json.img_filename && json.img_filename.trim() != "") {
        filename = json.img_filename.trim();
      }
      const base64 = await getBase64FromResponse(resp2);
      if (base64 === null) {
        throw new Error(
          "Failed to fetch img_url returned by the server while trying to create base64."
        );
      }
      const image = {
        metaData: {
          type: "file",
          link: filename
        },
        imageData: base64
      };
      await setImage(id, image);
    }
    return;
  }
  async function fetchAsUnit8Array(url) {
    try {
      const resp = await fetch(url);
      return new Uint8Array(await resp.arrayBuffer());
    } catch (e3) {
      return e3;
    }
  }
  function shareUrlFromShareId(id) {
    return "https://theme.smpp.be/" + id;
  }
  async function loadThemeShareCache() {
    const cache = await browser.storage.local.get("themeShareCache");
    if (!cache.themeShareCache) {
      return {};
    }
    return cache.themeShareCache;
  }
  async function purgeThemeShareCache(themeId) {
    const data = await loadThemeShareCache();
    delete data[themeId];
    await browser.storage.local.set({ themeShareCache: data });
  }
  async function getCachedShareId(themeId) {
    const data = await loadThemeShareCache();
    return data[themeId];
  }
  async function updateThemeShareCache(themeId, shareId) {
    const data = await loadThemeShareCache();
    data[themeId] = shareId;
    await browser.storage.local.set({ themeShareCache: data });
  }
  async function shareTheme(id) {
    const cachedShareId = await getCachedShareId(id);
    if (cachedShareId) {
      return shareUrlFromShareId(cachedShareId);
    }
    let theme = await getTheme(id);
    let image = await getImage(id);
    let hash = null;
    let imageData = null;
    if (image.imageData != "") {
      const data = await fetchAsUnit8Array(image.imageData);
      if (data instanceof Error) {
        throw new Error(
          "Failed to get image data while trying to sharing theme: " + data.message
        );
      }
      imageData = data;
      hash = fnv1aHash(imageData);
    }
    const apiTheme = {
      name: theme.displayName,
      css: theme.cssProperties,
      img_upload_chksum: hash,
      img_filename: image.metaData.link
    };
    const resp = await fetch("https://theme.smpp.be", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiTheme)
    });
    if (!resp.ok) {
      return new Error(await resp.text());
    }
    const themeInfo = await resp.json();
    if (themeInfo.needs_img && hash && imageData) {
      const resp2 = await fetch(
        "https://theme.smpp.be/" + themeInfo.id + "/image",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + themeInfo.edit_key
          },
          body: imageData.buffer
        }
      );
      if (!resp2.ok) {
        return new Error(await resp2.text());
      }
    }
    await updateThemeShareCache(id, themeInfo.id);
    return shareUrlFromShareId(themeInfo.id);
  }

  // src/background-scripts/settings.ts
  var settingsTemplate;
  var defaultSettings;
  async function getSettingsTemplate() {
    if (!settingsTemplate) {
      settingsTemplate = await loadJSON(
        "background-scripts/data/settings-template.json"
      );
    }
    settingsTemplate.appearance.theme = Object.keys(await getThemes());
    return settingsTemplate;
  }
  async function getDefaultSettings() {
    if (!defaultSettings) {
      defaultSettings = await loadJSON(
        "background-scripts/data/default-settings.json"
      );
    }
    return defaultSettings;
  }
  async function getSettingsData() {
    let data = (await browser.storage.local.get("settingsData")).settingsData;
    data = fillObjectWithDefaults(data, await getDefaultSettings());
    let categorized = {};
    const template = await getSettingsTemplate();
    for (const cat of Object.keys(template)) {
      for (const fieldName of Object.keys(template[cat])) {
        if (!categorized[cat]) {
          categorized[cat] = {};
        }
        Object.assign(categorized[cat], { [fieldName]: data[fieldName] });
      }
    }
    return categorized;
  }
  async function setSettingsData(data) {
    const settings = {};
    for (const category of Object.keys(data)) {
      Object.assign(settings, data[category]);
    }
    await browser.storage.local.set({ settingsData: settings });
  }

  // src/background-scripts/data-background-script.ts
  function getDefaultCustomThemeData() {
    return {
      color_accent: "#a3a2ec",
      color_base00: "#38313a",
      color_base01: "#826882",
      color_base02: "#ac85b7",
      color_base03: "#c78af0",
      color_text: "#ede3e3"
    };
  }
  var defaultPlantData = {};
  async function getDefaultPlantData() {
    if (Object.keys(defaultPlantData).length == 0) {
      defaultPlantData = await loadJSON(
        "background-scripts/data/default-plant-data.json"
      );
    }
    return defaultPlantData;
  }
  async function getPlantAppData() {
    let data = await browser.storage.local.get("plantAppData");
    let plantAppData = data.plantAppData || getDefaultPlantData();
    return plantAppData;
  }
  async function getCustomThemeData() {
    let data = await browser.storage.local.get("customThemeData");
    return data.customThemeData || getDefaultCustomThemeData();
  }
  var fallBackColorData = {};
  async function getFallbackColorData() {
    if (Object.keys(fallBackColorData).length == 0) {
      fallBackColorData = await loadJSON(
        "background-scripts/data/delijn-kleuren.json"
      );
    }
  }
  async function getDelijnColorData() {
    try {
      let data = await browser.storage.local.get("delijnColorData");
      let delijnColorData;
      if (data.delijnColorData?.kleuren != void 0) {
        delijnColorData = data.delijnColorData;
      } else {
        delijnColorData = await fetchDelijnData(
          "https://api.delijn.be/DLKernOpenData/api/v1/kleuren"
        );
      }
      await browser.storage.local.set({
        delijnColorData
      });
      return delijnColorData;
    } catch (error) {
      console.error("Error retrieving Delijn Color Data:", error);
      return getFallbackColorData;
    }
  }
  async function setImage(id, data) {
    const imagesMetaData = (await browser.storage.local.get("images")).images || {};
    imagesMetaData[id] = data.metaData;
    await browser.storage.local.set({ images: imagesMetaData });
    const customId = "SMPPImage-" + id;
    await browser.storage.local.set({ [customId]: data.imageData });
  }
  async function getImage(id) {
    const imagesMetaData = (await browser.storage.local.get("images")).images || {};
    let metaData = imagesMetaData[id];
    if (!metaData)
      return {
        metaData: { type: "default", link: "" },
        imageData: ""
      };
    const customId = "SMPPImage-" + id;
    const image = (await browser.storage.local.get(customId))[customId] || "";
    return {
      metaData,
      imageData: image
    };
  }
  async function removeImage(id) {
    const imagesMetaData = (await browser.storage.local.get("images")).images || {};
    delete imagesMetaData[id];
    const customId = "SMPPImage-" + id;
    await browser.storage.local.remove([customId]);
    await browser.storage.local.set({ images: imagesMetaData });
  }
  async function getBase64FromResponse(response) {
    let blob = await response.blob();
    let base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return base64;
  }
  async function getBase642(link) {
    try {
      let response = await fetch(link);
      if (!response.ok) {
        console.error(
          `Failed to fetch image: ${response.status} ${response.statusText}`
        );
        return null;
      }
      return getBase64FromResponse(response);
    } catch (error) {
      console.error("Error converting image to base64:", error);
      return null;
    }
  }
  async function getFileData(link) {
    try {
      let response = await fetch(link);
      if (!response.ok) return null;
      let blob = await response.blob();
      let arrayBuffer = await blob.arrayBuffer();
      const urlParts = link.split("/");
      const filename = urlParts[urlParts.length - 1] || "image.jpg";
      return {
        arrayBuffer: Array.from(new Uint8Array(arrayBuffer)),
        mimeType: blob.type || "image/jpeg",
        filename
      };
    } catch (error) {
      console.error("Error getting file data:", error);
      return null;
    }
  }
  async function migrateImagesV6() {
    let settings = await getSettingsData();
    let images = (await browser.storage.local.get("images")).images || {};
    if (images["profilePicture"]) {
      let profileImage = {
        metaData: {
          type: images["profilePicture"].type,
          link: images["profilePicture"].link
        },
        imageData: images["profilePicture"].imageData
      };
      delete images["profilePicture"];
      await browser.storage.local.set({ images });
      await setImage("profilePicture", profileImage);
      images = (await browser.storage.local.get("images")).images || {};
    }
    if (images["backgroundImage"]) {
      let backgroundImage = {
        metaData: {
          type: images["backgroundImage"].type,
          link: images["backgroundImage"].link
        },
        imageData: images["backgroundImage"].imageData
      };
      delete images["backgroundImage"];
      await browser.storage.local.set({ images });
      if (backgroundImage.metaData.type == "link") {
        backgroundImage.imageData = await getBase642(
          backgroundImage.metaData.link
        );
        if (backgroundImage.imageData != null) {
          backgroundImage.metaData.type = "file";
        } else {
          backgroundImage.imageData = "";
          backgroundImage.metaData.type = "default";
        }
      }
      await setImage(settings.appearance.theme, backgroundImage);
    }
  }

  // src/background-scripts/index.ts
  browser.runtime.onMessage.addListener(
    (message, _sender, sendResponse) => {
      handleMessage(message, sendResponse);
      return true;
    }
  );
  async function handleMessage(message, sendResponse) {
    try {
      if (message.action === "clearLocalStorage") {
        browser.storage.local.clear();
        sendResponse({ success: true });
        console.log("Cleared browser storage");
      }
      if (message.action === "importThemeFile") {
        const id = await importThemeFile(message.data);
        sendResponse({ id });
        return;
      }
      if (message.action === "getThemes") {
        let themes = await getThemes(
          message.categories,
          message.includeHidden,
          message.mustMatchAllCategories
        );
        sendResponse(themes);
        console.log(
          `Themes for categories: ${message.categories} sent, including hidden themes: ${message.includeHidden ? true : false}`
        );
        console.log(themes);
      }
      if (message.action === "getTheme") {
        let theme = await getTheme(message.name);
        sendResponse(theme);
        console.log(`Theme ${message.name} sent.`);
      }
      if (message.action == "getThemeCategories") {
        let categories2 = await getThemeCategories(message.includeHidden);
        sendResponse(categories2);
        console.log(`Theme categories sent: ${categories2}`);
      }
      if (message.action == "getFirstThemeInCategory") {
        let themeName = await getFirstThemeInCategory(
          message.category,
          message.includeHidden
        );
        sendResponse(themeName);
        console.log(
          `First theme in category ${message.category} sent: ${themeName}`
        );
      }
      if (message.action === "saveCustomTheme") {
        let id = await saveCustomTheme(message.data, message.id);
        sendResponse(id);
        console.log(`Custom theme ${message.id} saved as:`);
        console.log(message.data);
      }
      if (message.action === "removeCustomTheme") {
        await removeCustomTheme(message.id);
        sendResponse({ success: true });
        console.log(`Theme ${message.id} removed.`);
      }
      if (message.action === "markThemeAsModified") {
        await purgeThemeShareCache(message.name);
        sendResponse({ success: true });
      }
      if (message.action === "getSharedTheme") {
        const theme = await getSharedTheme(message.shareId);
        console.log("sending", theme);
        sendResponse({ theme });
      }
      if (message.action === "installTheme") {
        await installTheme(message.shareId);
        sendResponse({ success: true });
      }
      if (message.action === "shareTheme") {
        const output = await shareTheme(message.name);
        if (typeof output == "string") {
          console.log(`Theme ${message.name} was shared (url: ${output})`);
          sendResponse({ shareUrl: output });
        } else {
          sendResponse({ humanError: output.message });
        }
      }
      if (message.action === "setImage") {
        await setImage(message.id, message.data);
        sendResponse({ success: true });
        console.log(`Image with id:${message.id} saved.`);
      }
      if (message.action === "getImage") {
        const image = await getImage(message.id);
        sendResponse(image || null);
        console.log(`Image with id:${message.id} sent.`);
      }
      if (message.action === "getBase64") {
        const base64 = await getBase642(message.link);
        sendResponse(base64 || null);
        console.log(`Image with link:${message.link} converted to base64.`);
      }
      if (message.action === "getFileData") {
        const file = await getFileData(message.link);
        sendResponse(file || null);
        console.log(`Image with link:${message.link} converted to Data.`);
      }
      if (message.action === "fetchWeatherData") {
        const weatherData = await fetchWeatherData(message.location);
        sendResponse(weatherData);
        console.log("Weather data fetched and sent.");
      }
      if (message.action === "fetchDelijnData") {
        const delijnData = await fetchDelijnData(message.url);
        sendResponse(delijnData);
        console.log("Delijn appdata fetched and sent.");
      }
      if (message.action === "fetchIRailData") {
        const iRailData = await fetchIRailData(message.url);
        sendResponse(iRailData);
        console.log("iRail data fetched and sent.");
      }
      if (message.action === "getDelijnColorData") {
        let delijnColorData = await getDelijnColorData();
        sendResponse(delijnColorData);
        console.log("Delijn color data fetched and sent.");
      }
      if (message.action === "setPlantAppData") {
        await browser.storage.local.set({ plantAppData: message.data });
        sendResponse({ success: true });
      }
      if (message.action === "getPlantAppData") {
        const plantAppData = await getPlantAppData();
        sendResponse(plantAppData);
        console.log("Plant appdata sent.");
      }
      if (message.action === "setSetting") {
        const settingsData = await getSettingsData();
        setByPath(settingsData, message.name, message.data);
        await setSettingsData(settingsData);
        console.log(settingsData);
        sendResponse({ success: true });
      }
      if (message.action === "getSetting") {
        const settingsData = await getSettingsData();
        sendResponse(getByPath(settingsData, message.name));
        console.log("Setting " + message.name + "sent");
      }
      if (message.action === "setSettingsData") {
        await setSettingsData(message.data);
        sendResponse({ success: true });
        console.log("Settings data saved.");
      }
      if (message.action === "getSettingsData") {
        let settingsData = await getSettingsData();
        console.log(settingsData);
        sendResponse(settingsData);
        console.log("Settings data sent.");
      }
      if (message.action === "getSettingsTemplate") {
        const settingsTemplate2 = await getSettingsTemplate();
        sendResponse(getByPath(settingsTemplate2, message.name));
        console.log("Settings options sent.");
      }
      if (message.action === "getWidgetLayout") {
        console.log("Loading widget layout...");
        const data = await browser.storage.local.get("widgets");
        sendResponse(data.widgets);
      }
      if (message.action === "setWidgetLayout") {
        console.log("Saving widget layout...");
        await browser.storage.local.set({ widgets: message.layout });
        sendResponse({ success: true });
      }
      if (message.action === "getWidgetData") {
        console.log("Loading widget data...");
        const widgetId = "Game." + message.widget;
        let data = await browser.storage.local.get(widgetId);
        data = data[widgetId];
        sendResponse(data);
      }
      if (message.action === "setWidgetData") {
        console.log("Saving widget data...");
        let data = {};
        data["Game." + message.widget] = message.data;
        await browser.storage.local.set(data);
        sendResponse({ success: true });
      }
      if (message.action === "getDataVersion") {
        let dataVersion = await browser.storage.local.get("dataVersion");
        console.log(dataVersion);
        if (Object.keys(dataVersion).length == 0) {
          await browser.storage.local.set({ dataVersion: 6 });
          dataVersion = 6;
        }
        sendResponse(dataVersion.dataVersion);
        console.log(`Data version ${dataVersion.dataVersion} sent.`);
      }
      if (message.action === "setDataVersion") {
        await browser.storage.local.set({ dataVersion: message.version });
        sendResponse({ success: true });
      }
      if (message.action === "getDelijnAppData") {
        const delijnAppData = await browser.storage.local.get("delijnAppData");
        await browser.storage.local.remove("delijnAppData");
        sendResponse(delijnAppData);
        console.log("delijnAppData sent.");
      }
      if (message.action === "getWeatherAppData") {
        const weatherAppData = await browser.storage.local.get("weatherAppData");
        await browser.storage.local.remove("weatherAppData");
        sendResponse(weatherAppData);
        console.log("weatherAppData sent.");
      }
      if (message.action === "getBackgroundImage") {
        const backgroundImage = await browser.storage.local.get("backgroundImage");
        await browser.storage.local.remove("backgroundImage");
        sendResponse(backgroundImage);
        console.log("Background image sent.");
      }
      if (message.action === "getRawSettingsData") {
        let rawSettingsData = (await browser.storage.local.get("settingsData")).settingsData;
        sendResponse(rawSettingsData);
        console.log("Raw settings data sent.");
      }
      if (message.action === "setRawSettingsData") {
        console.log("Saving raw settings data...");
        console.log(message.data);
        await browser.storage.local.set({ settingsData: message.data });
        sendResponse({ success: true });
      }
      if (message.action === "migrateImagesV6") {
        console.log("Migrating images to V6...");
        await migrateImagesV6();
        sendResponse({ success: true });
      }
      if (message.action === "getCustomThemeData") {
        const customThemeData = await getCustomThemeData();
        sendResponse(customThemeData);
        console.log("Custom theme data data sent.");
      }
    } catch (err) {
      console.error("Service worker error:", err);
      sendResponse({ error: err.message || String(err) });
    }
  }
})();
