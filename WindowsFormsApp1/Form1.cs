using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using OpenTK;
using OpenTK.Graphics.OpenGL;

namespace WindowsFormsApp1
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
            glControl1.Invalidate();
        }
        private void glControl1_Load(object sender, EventArgs e)
        {
            glControl1.Invalidate();
        }

        private void glControl1_Paint(object sender, PaintEventArgs e)
        {
            View m = new View();
            m.InitShaders();

            GL.Viewport(0, 0, glControl1.Width, glControl1.Height);
            m.Update();

            glControl1.SwapBuffers();
            GL.UseProgram(0);
        }
    }
}
