document.addEventListener('DOMContentLoaded', () => {
    const factorBtn = document.getElementById('factorBtn');
    const stepsDiv = document.getElementById('steps');
  
    factorBtn.addEventListener('click', () => {
      const userPolynomial = document.getElementById('userPolynomial').value;
      const resultHTML = factorTrinomialStepByStep(userPolynomial);
      stepsDiv.innerHTML = resultHTML;
      
      // Recargamos MathJax para que renderice el contenido LaTeX
      if (window.MathJax) {
        window.MathJax.typeset();
      }
    });
  });
  
  /**
   * Factoriza un trinomio en la forma de trinomio cuadrado perfecto
   * y retorna el paso a paso en HTML con detalle matemático.
   *
   * @param {string} polyStr - Polinomio, ej. "16x^6 + 9y^22 - 24x^3y^11"
   * @return {string} - HTML con explicación paso a paso o mensaje de error.
   */
  function factorTrinomialStepByStep(polyStr) {
    // Limpiar espacios
    let poly = polyStr.replace(/\s+/g, '');
  
    // 1. Dividir en términos (separar por + o - manteniendo el signo)
    let terms = splitTerms(poly);
  
    // 2. Verificar que haya 3 términos
    if (terms.length !== 3) {
      return `<p>El polinomio debe tener 3 términos para ser un trinomio cuadrado perfecto. Se encontraron ${terms.length} término(s).</p>`;
    }
  
    // 3. Ordenar términos de forma descendente respecto a x (básico)
    terms = orderByX(terms);
  
    // 4. Parsear cada término para extraer coeficientes y exponentes
    const parsedTerms = terms.map(t => parseTerm(t));
  
    // AQUÍ el cambio: mostramos la expresión en un entorno matemático
    let stepHTML = `
      <p><strong>Paso 1: Ordenar el polinomio</strong><br>
      Ordenamos los términos de manera descendente respecto a la variable <em>x</em>.<br>
      Polinomio reordenado: \\[
        ${combineTerms(parsedTerms)}
      \\]
      </p>
    `;
  
    // Identificamos los términos:
    const termA = parsedTerms[0]; // Primer término (extremo izquierdo)
    const termB = parsedTerms[1]; // Término central
    const termC = parsedTerms[2]; // Tercer término (extremo derecho)
  
    // 5. Calcular las raíces cuadradas de los extremos
    const sqrtTermA = sqrtTerm(termA);
    const sqrtTermC = sqrtTerm(termC);
  
    if (!sqrtTermA || !sqrtTermC) {
      stepHTML += `<p>Alguno de los términos extremos no es un cuadrado perfecto (numérico o literal). No se puede factorizar como trinomio cuadrado perfecto.</p>`;
      return stepHTML;
    }
  
    // 6. Mostrar en detalle cómo se obtienen las raíces cuadradas
    stepHTML += `
      <p><strong>Paso 2: Calcular las raíces cuadradas de los términos extremos</strong></p>
      <p>
        <em>Primer término:</em> \\(${formatTerm(termA)}\\).<br>
        Aplicamos: 
        \\[
          \\sqrt{${formatTerm(termA, false)}} 
          = \\sqrt{${termA.coef}}\\,\\sqrt{x^{${termA.xExp}}}\\,\\sqrt{y^{${termA.yExp}}}
        \\]
        Como \\(\\sqrt{${termA.coef}} = ${sqrtTermA.coef}\\), \\(\\sqrt{x^{${termA.xExp}}} = x^{${termA.xExp/2}}\\) y \\(\\sqrt{y^{${termA.yExp}}} = y^{${termA.yExp/2}}\\),<br>
        obtenemos: \\(\\sqrt{${formatTerm(termA, false)}} = ${sqrtTermA.coef}${sqrtTermA.xExp > 0 ? "x^{" + sqrtTermA.xExp + "}" : ""}${sqrtTermA.yExp > 0 ? "y^{" + sqrtTermA.yExp + "}" : ""}\\).
      </p>
      <p>
        <em>Tercer término:</em> \\(${formatTerm(termC)}\\).<br>
        Aplicamos: 
        \\[
          \\sqrt{${formatTerm(termC, false)}} 
          = \\sqrt{${termC.coef}}\\,\\sqrt{x^{${termC.xExp}}}\\,\\sqrt{y^{${termC.yExp}}}
        \\]
        Dado que \\(\\sqrt{${termC.coef}} = ${sqrtTermC.coef}\\), \\(\\sqrt{x^{${termC.xExp}}} = x^{${termC.xExp/2}}\\) y \\(\\sqrt{y^{${termC.yExp}}} = y^{${termC.yExp/2}}\\),<br>
        obtenemos: \\(\\sqrt{${formatTerm(termC, false)}} = ${sqrtTermC.coef}${sqrtTermC.xExp > 0 ? "x^{" + sqrtTermC.xExp + "}" : ""}${sqrtTermC.yExp > 0 ? "y^{" + sqrtTermC.yExp + "}" : ""}\\).
      </p>
    `;
  
    // 7. Verificar que el término central es el esperado
    const expectedCoef = 2 * sqrtTermA.coef * sqrtTermC.coef;
    const expectedXExp = sqrtTermA.xExp + sqrtTermC.xExp;
    const expectedYExp = sqrtTermA.yExp + sqrtTermC.yExp;
  
    const actualCoef = termB.coef;
    const actualXExp = termB.xExp;
    const actualYExp = termB.yExp;
  
    let signCenter = null;
    if (actualCoef === expectedCoef) signCenter = '+';
    if (actualCoef === -expectedCoef) signCenter = '-';
  
    stepHTML += `
      <p><strong>Paso 3: Verificar el término central</strong><br>
        El término central esperado es:<br>
        \\[
          \\pm 2\\cdot \\left(${formatTerm(sqrtTermA, false)}\\right) \\cdot \\left(${formatTerm(sqrtTermC, false)}\\right)
          = \\pm ${expectedCoef} x^{${expectedXExp}} y^{${expectedYExp}}
        \\]
        Término central ingresado: \\(${formatTerm(termB)}\\).
      </p>
    `;
  
    // 8. Evaluar si el trinomio es cuadrado perfecto
    if (signCenter !== null && actualXExp === expectedXExp && actualYExp === expectedYExp) {
      const signSymbol = (signCenter === '+') ? '+' : '-';
  
      stepHTML += `
        <p>
          Se cumple que el 2do término \\(${formatTerm(termB)}\\) es igual a \\(${signSymbol}2 \\cdot ${formatTerm(sqrtTermA)} \\cdot ${formatTerm(sqrtTermC)}\\).<br>
          Por lo tanto, el trinomio es un <strong>cuadrado perfecto</strong>.
        </p>
      `;
  
      // 9. Mostrar la factorización final
      const factor = `(${formatTerm(sqrtTermA, false)} ${signSymbol} ${formatTerm(sqrtTermC, false)})^2`;
  
      stepHTML += `
        <p><strong>Paso 4: Escribir la factorización final</strong><br>
          Se tiene que:<br>
          \\[
            ${formatTerm(termA)} ${termB.coef < 0 ? '' : '+'} ${formatTerm(termB)} ${termC.coef < 0 ? '' : '+'} ${formatTerm(termC)}
            = ${factor}
          \\]
          <br>
          Es decir, al expresar el trinomio en términos de las raíces de sus extremos, obtenemos que el polinomio es el cuadrado del binomio \\(${formatTerm(sqrtTermA, false)} ${signSymbol} ${formatTerm(sqrtTermC, false)}\\).
        </p>
      `;
    } else {
      stepHTML += `
        <p>
          El término central ingresado \\(${formatTerm(termB)}\\) no coincide con el esperado \\(\\pm 2\\cdot ${formatTerm(sqrtTermA)} \\cdot ${formatTerm(sqrtTermC)}\\).<br>
          Por lo tanto, <strong>no</strong> se puede factorizar el trinomio como un cuadrado perfecto.
        </p>
      `;
    }
  
    return stepHTML;
  }
  
  /**
   * Separa el polinomio en términos, manteniendo los signos.
   * Ej: "16x^2+9y^2-24xy" → ["16x^2", "+9y^2", "-24xy"]
   */
  function splitTerms(poly) {
    let modified = poly.replace(/(?<!^)(?=[+-])/g, ' ');
    return modified.split(/\s+/);
  }
  
  /**
   * Ordena los términos descendentemente según el exponente de x.
   */
  function orderByX(terms) {
    return terms.sort((a, b) => {
      const parsedA = parseTerm(a);
      const parsedB = parseTerm(b);
      return parsedB.xExp - parsedA.xExp; // Orden descendente
    });
  }
  
  /**
   * Parsea un término del tipo "3x^2y^5" o "-24x^3y^11".
   * Retorna un objeto {coef, xExp, yExp}.
   */
  function parseTerm(termStr) {
    const regexCoef = /^([+-]?\d+(\.\d+)?)?/;
    const matchCoef = termStr.match(regexCoef);
    
    let coefStr = matchCoef && matchCoef[0] ? matchCoef[0] : '';
    let coef = 1;
    if (coefStr === '' || coefStr === '+') coef = 1;
    else if (coefStr === '-') coef = -1;
    else coef = parseFloat(coefStr);
  
    let remainder = termStr.replace(regexCoef, '');
  
    // Buscar exponente de x
    let xExp = 0;
    const regexX = /x(\^\d+)?/;
    const matchX = remainder.match(regexX);
    if (matchX) {
      if (matchX[1]) {
        xExp = parseInt(matchX[1].replace('^',''), 10);
      } else {
        xExp = 1;
      }
      remainder = remainder.replace(regexX, '');
    }
  
    // Buscar exponente de y
    let yExp = 0;
    const regexY = /y(\^\d+)?/;
    const matchY = remainder.match(regexY);
    if (matchY) {
      if (matchY[1]) {
        yExp = parseInt(matchY[1].replace('^',''), 10);
      } else {
        yExp = 1;
      }
      remainder = remainder.replace(regexY, '');
    }
  
    return { coef, xExp, yExp };
  }
  
  /**
   * Calcula la raíz cuadrada del término (si es cuadrado perfecto).
   * Retorna null si no es posible.
   */
  function sqrtTerm(term) {
    const sqrtCoef = Math.sqrt(Math.abs(term.coef));
    if (!Number.isInteger(sqrtCoef)) return null;
    if (term.coef < 0) return null;
  
    if (term.xExp % 2 !== 0 || term.yExp % 2 !== 0) return null;
  
    return {
      coef: sqrtCoef,
      xExp: term.xExp / 2,
      yExp: term.yExp / 2
    };
  }
  
  /**
   * Convierte {coef, xExp, yExp} a una cadena en formato LaTeX.
   * Si showSign es false, no muestra el signo '+' inicial.
   */
  function formatTerm(term, showSign = true) {
    let { coef, xExp, yExp } = term;
    coef = Math.round(coef * 1000) / 1000;
  
    let signStr = '';
    if (showSign) {
      if (coef >= 0) signStr = `+${coef}`;
      else signStr = `${coef}`;
    } else {
      signStr = `${coef}`;
    }
  
    if (Math.abs(coef) === 1 && (xExp !== 0 || yExp !== 0)) {
      if (coef === 1) signStr = (showSign ? '+' : '');
      else signStr = '-';
    }
  
    let xPart = '';
    if (xExp > 0) {
      xPart = (xExp === 1) ? 'x' : `x^${xExp}`;
    }
  
    let yPart = '';
    if (yExp > 0) {
      yPart = (yExp === 1) ? 'y' : `y^${yExp}`;
    }
  
    const literalPart = xPart + yPart;
    if (!literalPart) {
      return signStr;
    } else {
      let cleanedSignStr = signStr;
      if (signStr === '+1') cleanedSignStr = '+';
      if (signStr === '-1') cleanedSignStr = '-';
      if (signStr === '1') cleanedSignStr = '';
      if (signStr === '-1') cleanedSignStr = '-';
      return cleanedSignStr + literalPart;
    }
  }
  
  /**
   * Combina un arreglo de términos parseados en un solo string.
   */
  function combineTerms(parsedArr) {
    return parsedArr.map((t, i) => {
      return formatTerm(t, i !== 0);
    }).join('');
  }
  