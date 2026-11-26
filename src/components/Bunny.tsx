import type { Fur, OutfitId } from "@/lib/rewards";

export function Bunny({ fur = "vanilla", outfit = "classic", small = false }: { fur?: Fur; outfit?: OutfitId; small?: boolean }) {
  return (
    <svg viewBox="0 0 300 350" role="img" aria-label={`${fur} bunny wearing ${outfit}`} className={`bunny-art bunny-fur-${fur} ${small ? "" : "bunny-alive"}`}>
      <ellipse cx="150" cy="326" rx="78" ry="11" className="bunny-shadow" />
      <g className="bunny-character" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="207" cy="261" rx="24" ry="26" className="bunny-coat bunny-line" />
        <ellipse cx="122" cy="85" rx="24" ry="65" transform="rotate(-12 122 85)" className="bunny-coat bunny-line" />
        <ellipse cx="179" cy="85" rx="24" ry="65" transform="rotate(12 179 85)" className="bunny-coat bunny-line" />
        <ellipse cx="121" cy="77" rx="10" ry="43" transform="rotate(-12 121 77)" className="bunny-cheek" />
        <ellipse cx="180" cy="77" rx="10" ry="43" transform="rotate(12 180 77)" className="bunny-cheek" />
        <ellipse cx="150" cy="250" rx="59" ry="69" className="bunny-coat bunny-line" />
        <ellipse cx="111" cy="309" rx="29" ry="16" className="bunny-coat bunny-line" />
        <ellipse cx="188" cy="309" rx="29" ry="16" className="bunny-coat bunny-line" />
        {outfit === "sweater" && <g><path d="M103 207 Q150 193 197 207 L209 266 L190 272 L185 291 Q150 304 115 291 L110 272 L91 266 Z" className="bunny-rose bunny-line" /><path d="M117 283 H183 M111 253 L117 268 M190 253 L184 268" className="bunny-seam" /><path d="M143 244 Q132 233 132 246 Q132 255 150 266 Q168 255 168 246 Q168 233 157 244 L150 250 Z" className="bunny-light" /></g>}
        {outfit === "overalls" && <g><path d="M108 220 L126 220 L128 203 L138 203 L140 222 L160 222 L162 203 L172 203 L174 220 L192 220 L191 291 L159 291 L150 280 L141 291 L109 291 Z" className="bunny-blue bunny-line" /><rect x="131" y="245" width="38" height="26" rx="7" className="bunny-pocket" /><circle cx="133" cy="228" r="4" className="bunny-light" /><circle cx="167" cy="228" r="4" className="bunny-light" /></g>}
        {outfit === "garden" && <g><path d="M119 201 Q150 216 181 201 L190 239 L210 292 Q150 317 90 292 L110 239 Z" className="bunny-sage bunny-line" />{[[123,250],[173,266],[148,285],[188,292],[112,284]].map(([x,y], i) => <g key={i} transform={`translate(${x} ${y})`} className="bunny-light"><circle cy="-4" r="4" /><circle cx="4" r="4" /><circle cy="4" r="4" /><circle cx="-4" r="4" /><circle r="2" className="bunny-rose" /></g>)}</g>}
        {outfit === "starlight" && <g><path d="M116 199 Q150 192 184 199 L224 295 Q199 289 179 302 L150 289 L120 302 Q102 289 76 295 Z" className="bunny-blue bunny-line" />{[[106,265],[191,254],[163,282],[125,229]].map(([x,y],i) => <path key={i} transform={`translate(${x} ${y})`} d="M0 -8 L3 -2 L9 0 L3 3 L0 9 L-3 3 L-9 0 L-3 -2 Z" className="bunny-light" />)}</g>}
        <ellipse cx="95" cy="252" rx="15" ry="29" transform="rotate(15 95 252)" className="bunny-coat bunny-line" />
        <ellipse cx="205" cy="252" rx="15" ry="29" transform="rotate(-15 205 252)" className="bunny-coat bunny-line" />
        <path d="M82 158 Q76 108 120 106 Q150 97 180 106 Q224 108 218 158 Q220 205 150 209 Q80 205 82 158 Z" className="bunny-coat bunny-line" />
        <ellipse cx="108" cy="175" rx="16" ry="10" className="bunny-cheek" />
        <ellipse cx="192" cy="175" rx="16" ry="10" className="bunny-cheek" />
        <g className="bunny-eyes"><ellipse cx="123" cy="156" rx="5" ry="7" className="bunny-ink" /><ellipse cx="177" cy="156" rx="5" ry="7" className="bunny-ink" /></g>
        <path d="M144 173 Q150 170 156 173 Q154 178 150 179 Q146 178 144 173" className="bunny-rose" />
        <path d="M150 179 V183 Q143 192 137 184 M150 183 Q157 192 163 184" className="bunny-smile" />
        {(outfit === "scarf" || outfit === "garden" || outfit === "starlight") && <g><path d="M145 207 Q118 186 119 209 Q119 229 145 212 M155 207 Q182 186 181 209 Q181 229 155 212" className="bunny-rose bunny-line" /><circle cx="150" cy="210" r="7" className="bunny-rose bunny-line" />{outfit === "scarf" && <path d="M146 216 L138 244 L150 238 L161 245 L154 216" className="bunny-rose bunny-line" />}</g>}
        {outfit === "garden" && <g transform="translate(194 110)"><circle cx="-7" r="9" className="bunny-light" /><circle cy="-7" r="9" className="bunny-light" /><circle cx="7" r="9" className="bunny-light" /><circle cy="7" r="9" className="bunny-light" /><circle r="6" className="bunny-rose" /></g>}
      </g>
    </svg>
  );
}