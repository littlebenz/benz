/** @forRange */
declare function forRange(
    start: number,
    limit: number,
    step?: number
): number[];

interface ldLine {
    frame: WoWAPI.Frame | undefined;
    r: number;
    g: number;
    b: number;
    a: number;
    w: number;
}

interface ldCanvas {
    frame: WoWAPI.Frame | undefined;
    lines: ldLine[];
    linesUsed: any[];
    textures: any[];
    texturesUsed: any[];
    fontStrings: any[];
    fontStringsUsed: any[];
}
export class Libdraw {
    initLibdraw: boolean = false;
    level: WoWAPI.FrameStrata = "BACKGROUND";
    m_line: ldLine = { frame: undefined, r: 0, g: 1, b: 0, a: 1, w: 1 };
    multi: any = (UIParent as any).GetEffectiveScale();
    callbacks: any[] = [];
    canvas: ldCanvas = {
        frame: undefined,
        lines: [],
        linesUsed: [],
        textures: [],
        texturesUsed: [],
        fontStrings: [],
        fontStringsUsed: [],
    };
    wfTop = WorldFrame.GetTop();
    fullCircle: number = math.rad(365);
    smallCircleStep: number = math.rad(3);

    init() {}

    public setClassColor(unitClass: string) {
        if (unitClass == "WARRIOR")
            return this.setColorRaw(0.78, 0.61, 0.43, 1);
        else if (unitClass == "WARLOCK")
            return this.setColorRaw(0.58, 0.51, 0.79, 1);
        else if (unitClass == "PALADIN")
            return this.setColorRaw(0.96, 0.55, 0.73, 1);
        else if (unitClass == "HUNTER")
            return this.setColorRaw(0.67, 0.83, 0.45, 1);
        else if (unitClass == "ROGUE")
            return this.setColorRaw(1.0, 0.96, 0.41, 1);
        else if (unitClass == "PRIEST")
            return this.setColorRaw(1.0, 1.0, 1.0, 1);
        else if (unitClass == "DEATHKNIGHT")
            return this.setColorRaw(0.78, 0.61, 0.43, 1);
        else if (unitClass == "SHAMAN")
            return this.setColorRaw(0.0, 0.44, 0.87, 1);
        else if (unitClass == "MAGE")
            return this.setColorRaw(0.41, 0.8, 0.94, 1);
        else if (unitClass == "MONK")
            return this.setColorRaw(0.33, 0.54, 0.52, 1);
        else if (unitClass == "DRUID")
            return this.setColorRaw(1.0, 0.49, 0.04, 1);
        else if (unitClass == "DEMONHUNTER")
            return this.setColorRaw(0.64, 0.19, 0.79, 1);
        else return this.setColorRaw(1.0, 1.0, 1.0, 1);
    }

    public setColorRaw(r: number, g: number, b: number, a: number) {
        this.m_line.r = r;
        this.m_line.g = g;
        this.m_line.b = b;
        this.m_line.a = a;
    }

    public setColor(r: number, g: number, b: number, a?: number) {
        a ? (a = a * 0.01) : (a = 1);
        this.m_line.r = r * 0.00390625;
        this.m_line.g = g * 0.00390625;
        this.m_line.b = b * 0.00390625;
        this.m_line.a = a;
    }

    public setWith(w: number) {
        this.m_line.w = w * 1;
    }

    public w2s(wX: number, wY: number, wZ: number): [number, number] {
        let ret = WorldToScreen(wX, wY, wZ);
        let sX = ret[0];
        let sY = ret[1];

        if (sX && sY) {
            return [sX * this.multi, sY * this.multi * -1];
        } else {
            return [sX, sY];
        }
    }

    public tW2s(tbl: [number, number, number]): [number, number] {
        let ret = WorldToScreen(tbl[0], tbl[1], tbl[2]);
        let sX = ret[0];
        let sY = ret[1];

        if (sX && sY) {
            return [sX * this.multi, sY * this.multi * -1];
        } else {
            return [sX, sY];
        }
    }

    public line(
        sx: number,
        sy: number,
        sz: number,
        ex: number,
        ey: number,
        ez: number
    ) {
        let r1 = this.w2s(sx, sy, sz);
        let r2 = this.w2s(ex, ey, ez);
        sx = r1[0];
        sy = r1[1];
        ex = r2[0];
        ey = r2[1];

        //let checkSX: boolean = true
        //let checkSY: boolean = true
        //let checkEX: boolean = true
        //let checkEY: boolean = true
        //let Height = GetScreenHeight();
        //let Width = GetScreenWidth();

        //if (sx <= 0 || sx >= Width){
        //    checkSX = false
        //}

        //if (sy <= 0 || sy >= (Height))
        // checkSY = false

        //if (ex <= 0 || ex >= (Width))
        //    checkEX = false

        //if (ey <= 0||  ey >= (Height) )
        //    checkEY = false

        //
        //let ret = checkSX && checkSY && checkEX && checkEY
        //if(!ret) return;
        //else
        //{
        this.draw2DLine(sx, sy, ex, ey);
        //}
    }

    public draw2DLine(sx: number, sy: number, ex: number, ey: number) {
        let buffer;
        if (this.canvas.lines.length > 0) {
            buffer = table.remove(this.canvas.lines)?.frame;
        } else buffer == undefined;
        let L: any = buffer;
        if (L == undefined && this.canvas.frame) {
            L = CreateFrame("Frame", this.canvas.frame.GetName());
            L.line = L.CreateLine();
            L.line.SetDrawLayer(this.level);
        }
        table.insert(this.canvas.linesUsed, L);
        L.ClearAllPoints();
        if ((sx > ex && sy > ey) || (sx < ey && sy < ey)) {
            // BOTTOMLEFT
            L.SetPoint("TOPRIGHT", this.canvas.frame, "TOPLEFT", sx, sy);
            L.SetPoint("BOTTOMLEFT", this.canvas.frame, "TOPLEFT", ex, ey);
            L.line.SetStartPoint("TOPRIGHT");
            L.line.SetEndPoint("BOTTOMLEFT");
        } else if (sx < ex && sy > ey) {
            //BOTTOMRIGHT
            L.SetPoint("TOPLEFT", this.canvas.frame, "TOPLEFT", sx, sy);
            L.SetPoint("BOTTOMRIGHT", this.canvas.frame, "TOPLEFT", ex, ey);
            L.line.SetStartPoint("TOPLEFT");
            L.line.SetEndPoint("BOTTOMRIGHT");
        } else if (sx > ex && sy < ey) {
            //TOPLEFT
            L.SetPoint("TOPRIGHT", this.canvas.frame, "TOPLEFT", sx, sy);
            L.SetPoint("BOTTOMLEFT", this.canvas.frame, "TOPLEFT", ex, ey);
            L.line.SetStartPoint("TOPLEFT");
            L.line.SetEndPoint("BOTTOMRIGHT");
        } else if (sx < ex && sy < ey) {
            // TOP RIGHT
            L.SetPoint("TOPLEFT", this.canvas.frame, "TOPLEFT", sx, sy);
            L.SetPoint("BOTTOMRIGHT", this.canvas.frame, "TOPLEFT", ex, ey);
            L.line.SetStartPoint("TOPRIGHT");
            L.line.SetEndPoint("BOTTOMLEFT");
        }

        L.line.SetThickness(this.m_line.w);
        L.line.SetColorTexture(
            this.m_line.r,
            this.m_line.g,
            this.m_line.b,
            this.m_line.a
        );
        L.Show();
    }

    public text(txt: string, font: any, x: number, y: number, z: number) {
        let w2sRet = this.w2s(x, y, z);
        let sx = w2sRet[0];
        let sy = w2sRet[1];
        if (sx && sy) {
            let buffer;
            if (this.canvas.fontStrings.length > 0) {
                buffer = table.remove(this.canvas.fontStrings)?.frame;
            } else buffer == undefined;
            let F: any = buffer;
            if (F == undefined && this.canvas.frame) {
                F = this.canvas.frame.CreateFontString(undefined, "BACKGROUND");
            }
            F.SetFontObject(font);
            F.SetText(txt);
            F.SetTextColor(
                this.m_line.r,
                this.m_line.g,
                this.m_line.g,
                this.m_line.a
            );
            F.SetPoint(
                "TOPLEFT",
                UIParent,
                "TOPLEFT",
                sx - F.GetStringWidth() * 0.5,
                sy
            );
            F.Show();
            table.insert(this.canvas.fontStringsUsed, F);
        }
    }

    public rotateX(
        cx: number,
        cy: number,
        cz: number,
        px: number,
        py: number,
        pz: number,
        r: number
    ): [number, number, number] {
        let s = math.sin(r);
        let c = math.cos(r);
        (px = px - cx), (py = py - cy);
        pz = pz - cz;
        let x = px + cx;
        let y = py * c - pz * s + cy;
        let z = py * s + pz * c + cz;

        let ret: [number, number, number] = [x, y, z];
        return ret;
    }

    public circle(x: number, y: number, z: number, size: number) {
        let step = this.smallCircleStep * 2;
        let lx = undefined;
        let ly = undefined;
        let nx = undefined;
        let ny = undefined;

        for (let v = 0; v < this.fullCircle; v += this.smallCircleStep * 10) {
            let ret = this.w2s(
                x + math.cos(v) * size,
                y + math.sin(v) * size,
                z
            );
            nx = ret[0];
            ny = ret[1];
            if (lx && ly) this.draw2DLine(lx, ly, nx, ny);
            lx = nx;
            ly = ny;
        }
    }

    public groundCircle(x: number, y: number, z: number, size: number) {
        let lx = undefined;
        let ly = undefined;
        let nx = undefined;
        let ny = undefined;
        let fx = undefined;
        let fy = undefined;
        let fz = undefined;
        let flags = bit.bor(0x100111);
        for (let v = 0; v < this.fullCircle; v += this.smallCircleStep * 8) {
            let ret = TraceLine(
                x + math.cos(v) * size,
                y + math.sin(v) * size,
                z + 4,
                x + math.cos(v) * size,
                y + math.sin(v) * size,
                z - 100000,
                flags
            );
            fx = x + math.cos(v) * size;
            fy = y + math.sin(v) * size;
            fz = ret[3];

            if (fx == undefined) {
                fx = x + math.cos(v) * size;
                fy = y + math.sin(v) * size;
                fz = z;
            }
            fz ? fz : (fz = z);
            let ret2 = this.w2s(
                fx + math.cos(v) * size,
                fy + math.sin(v) * size,
                fz
            );
            nx = ret2[0];
            ny = ret2[1];
            if (lx && ly) this.draw2DLine(lx, ly, nx, ny);
            lx = nx;
            ly = ny;
        }
    }

    public enable(interval?: number) {
        let timer;
        interval ? interval : (interval = 0.01);
        timer = C_Timer.NewTicker(interval, () => this.onUpdate());
        return timer;
    }

    public onUpdate() {
        this.clearCanvas();

        this.callbacks.forEach((cb) => {
            cb();
        });
    }

    clearCanvas() {
        //textures
        if (this.canvas.texturesUsed.length > 0) {
            for (const i of forRange(this.canvas.texturesUsed.length, 1, -1)) {
                this.canvas.texturesUsed[i - 1].Hide();
                table.insert(
                    this.canvas.textures,
                    table.remove(this.canvas.texturesUsed)
                );
            }
        }

        //fonts
        if (this.canvas.fontStringsUsed.length > 0) {
            for (const i of forRange(
                this.canvas.fontStringsUsed.length,
                1,
                -1
            )) {
                this.canvas.fontStringsUsed[i - 1].Hide();
                table.insert(
                    this.canvas.fontStrings,
                    table.remove(this.canvas.fontStringsUsed)
                );
            }
        }

        //lines
        if (this.canvas.linesUsed.length > 0) {
            for (const i of forRange(this.canvas.linesUsed.length, 1, -1)) {
                this.canvas.linesUsed[i - 1].Hide();
                table.insert(
                    this.canvas.lines,
                    table.remove(this.canvas.linesUsed)
                );
            }
        }
    }

    sync(handler: () => void) {
        table.insert(this.callbacks, handler);
    }

    deSync(index: number) {
        table.remove(this.callbacks, index);
    }

    public box(
        x: number,
        y: number,
        z: number,
        width: number,
        height: number,
        rotation?: number,
        offset_x?: number,
        offset_y?: number
    ) {
        offset_x ? offset_x : (offset_x = 0);
        offset_y ? offset_y : (offset_y = 0);
        if (rotation) rotation += math.rad(-90);
        else rotation = 0;

        let half_width = width * 0.5;
        let half_height = height * 0.5;

        let p1 = this.rotateZ(
            x,
            y,
            z,
            x - half_width + offset_x,
            y - half_width + offset_y,
            z,
            rotation
        );
        let p2 = this.rotateZ(
            x,
            y,
            z,
            x + half_width + offset_x,
            y - half_width + offset_y,
            z,
            rotation
        );
        let p3 = this.rotateZ(
            x,
            y,
            z,
            x - half_width + offset_x,
            y + half_width + offset_y,
            z,
            rotation
        );
        let p4 = this.rotateZ(
            x,
            y,
            z,
            x - half_width + offset_x,
            y - half_width + offset_y,
            z,
            rotation
        );
        let p5 = this.rotateZ(
            x,
            y,
            z,
            x + half_width + offset_x,
            y + half_width + offset_y,
            z,
            rotation
        );
        let p6 = this.rotateZ(
            x,
            y,
            z,
            x + half_width + offset_x,
            y - half_width + offset_y,
            z,
            rotation
        );
        let p7 = this.rotateZ(
            x,
            y,
            z,
            x - half_width + offset_x,
            y + half_width + offset_y,
            z,
            rotation
        );
        let p8 = this.rotateZ(
            x,
            y,
            z,
            x + half_width + offset_x,
            y + half_width + offset_y,
            z,
            rotation
        );

        this.line(p1[0], p1[1], z, p2[0], p2[1], z);
        this.line(p3[0], p3[1], z, p4[0], p4[1], z);
        this.line(p5[0], p5[1], z, p6[0], p6[1], z);
        this.line(p7[0], p7[1], z, p8[0], p8[1], z);
    }

    public box3D(
        x: number,
        y: number,
        z: number,
        width: number,
        height: number,
        hauteur: number,
        rotation?: number,
        offset_x?: number,
        offset_y?: number
    ) {
        offset_x ? offset_x : (offset_x = 0);
        offset_y ? offset_y : (offset_y = 0);
        if (rotation) rotation += math.rad(-90);
        else rotation = 0;

        let half_width = width * 0.5;
        let half_height = height * 0.5;

        let p1 = this.rotateZ(
            x,
            y,
            z,
            x - half_width + offset_x,
            y - half_width + offset_y,
            z,
            rotation
        );
        let p2 = this.rotateZ(
            x,
            y,
            z,
            x + half_width + offset_x,
            y - half_width + offset_y,
            z,
            rotation
        );
        let p3 = this.rotateZ(
            x,
            y,
            z,
            x - half_width + offset_x,
            y + half_width + offset_y,
            z,
            rotation
        );
        let p4 = this.rotateZ(
            x,
            y,
            z,
            x - half_width + offset_x,
            y - half_width + offset_y,
            z,
            rotation
        );
        let p5 = this.rotateZ(
            x,
            y,
            z,
            x + half_width + offset_x,
            y + half_width + offset_y,
            z,
            rotation
        );
        let p6 = this.rotateZ(
            x,
            y,
            z,
            x + half_width + offset_x,
            y - half_width + offset_y,
            z,
            rotation
        );
        let p7 = this.rotateZ(
            x,
            y,
            z,
            x - half_width + offset_x,
            y + half_width + offset_y,
            z,
            rotation
        );
        let p8 = this.rotateZ(
            x,
            y,
            z,
            x + half_width + offset_x,
            y + half_width + offset_y,
            z,
            rotation
        );

        this.line(p1[0], p1[1], z, p2[0], p2[1], z);
        this.line(p3[0], p3[1], z, p4[0], p4[1], z);
        this.line(p5[0], p5[1], z, p6[0], p6[1], z);
        this.line(p7[0], p7[1], z, p8[0], p8[1], z);

        this.line(p1[0], p1[1], z + hauteur, p2[0], p2[1], z + hauteur);
        this.line(p3[0], p3[1], z + hauteur, p4[0], p4[1], z + hauteur);
        this.line(p5[0], p5[1], z + hauteur, p6[0], p6[1], z + hauteur);
        this.line(p7[0], p7[1], z + hauteur, p8[0], p8[1], z + hauteur);

        this.line(p1[0], p1[1], z, p1[0], p1[1], z + hauteur);
        this.line(p2[0], p2[1], z, p2[0], p2[1], z + hauteur);
        this.line(p3[0], p3[1], z, p3[0], p3[1], z + hauteur);
        this.line(p5[0], p5[1], z, p5[0], p5[1], z + hauteur);
    }

    public rotateZ(
        cx: number,
        cy: number,
        cz: number,
        px: number,
        py: number,
        pz: number,
        r?: number
    ): [number, number, number] {
        if (!r) {
            return [px, py, pz];
        }
        let s = math.sin(r);
        let c = math.cos(r);

        px = px - cx;
        py = py - cy;
        pz = pz - cz;

        let x = px * c - py * s + cx;
        let y = px * s + py * c + cy;
        let z = pz + cz;

        let ret: [number, number, number] = [x, y, z];
        return ret;
    }

    constructor() {
        this.canvas.frame = CreateFrame("Frame");
        this.canvas.frame.SetAllPoints(WorldFrame);
    }
}
