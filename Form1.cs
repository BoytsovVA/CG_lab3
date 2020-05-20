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


namespace Lab3Boytsov
{
    
    public partial class Form1 : Form
    {
        View view;
        bool loaded = false;
        public Form1()
        {
            InitializeComponent();
            view = new View();
            groupBox1.Visible = true;
            groupBox2.Visible = true;
        }

        private void glControl1_Load(object sender, EventArgs e)
        {
            loaded = true;
            view.Setup();
        }

        private void glControl1_Paint(object sender, PaintEventArgs e)
        {
            if (!loaded) return;
            view.Update();
            glControl1.SwapBuffers();
            GL.UseProgram(0);
        }
        

        private void checkBox1_CheckedChanged(object sender, EventArgs e) 
        {
            if (checkBox1.Checked == false)
            {
                groupBox1.Visible = false;
                view.OffBigSphere();
            }
            else
            {
                groupBox1.Visible = true;
                if (radioButton3.Checked == true) view.RefractBigSphere();
                else if (radioButton1.Checked == true) view.DiffuseBigSphere();
                else if (radioButton2.Checked == true) view.ReflectBigSphere();
            }
            
            view.Setup();
            view.Update();
            glControl1.SwapBuffers();
            GL.UseProgram(0);               
        }

        private void button1_Click(object sender, EventArgs e)      //нажали на кнопку "ОК"
        {
            double x = 0, y = 0, z = 0;
            try
            {                
                x = Convert.ToDouble(textBox1.Text);
                y = Convert.ToDouble(textBox2.Text);
                z = Convert.ToDouble(textBox3.Text);
                 if ((x <= 1.0) && (y <= 1.0) && (z <= 1.0) && (x >= 0.0) && (y >= 0.0) && (z >= 0.0))
                 {
                    view.ColorBigSphere((float)x,(float)y,(float)z);
                    if (radioButton3.Checked == true)
                    {
                        view.RefractBigSphere();
                       
                    }
                    if (radioButton1.Checked == true)
                    {
                        view.DiffuseBigSphere();
                        
                    }
                    if (radioButton2.Checked == true)
                    {
                        view.ReflectBigSphere();
                        
                    }
                    view.Setup();
                    view.Update();
                    glControl1.SwapBuffers();
                    GL.UseProgram(0);
                    groupBox1.Visible = true;
                }
                 else MessageBox.Show("Введите корректные данные", "Ошибка", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            catch
            {
                MessageBox.Show("Введите корректные данные", "Ошибка",
                MessageBoxButtons.OK, MessageBoxIcon.Error);
            }           
        }

        private void button2_Click(object sender, EventArgs e)          //если нажали кнопку "изменить"
        {
            groupBox1.Visible = true;
        }

        private void checkBox2_CheckedChanged(object sender, EventArgs e)       //маленькая сфера
        {
            if (checkBox2.Checked == false)
            {
                groupBox2.Visible = false;
                view.OffSmallSphere();
            }
            else
            {
                groupBox2.Visible = true;
                if (radioButton6.Checked == true) view.RefractSmallSphere();
                else if (radioButton4.Checked == true) view.DiffuseSmallSphere();
                else if (radioButton5.Checked == true) view.ReflectSmallSphere();
            }
            view.Setup();
            view.Update();
            glControl1.SwapBuffers();
            GL.UseProgram(0);
        }

        private void button3_Click(object sender, EventArgs e)
        {
            double x = 0, y = 0, z = 0;
            try
            {
                x = Convert.ToDouble(textBox4.Text);
                y = Convert.ToDouble(textBox5.Text);
                z = Convert.ToDouble(textBox6.Text);
                if ((x <= 1.0) && (y <= 1.0) && (z <= 1.0) && (x >= 0.0) && (y >= 0.0) && (z >= 0.0))
                {
                    view.ColorSmallSphere((float)x, (float)y, (float)z);
                    if (radioButton6.Checked == true)
                    {
                        view.RefractSmallSphere();

                    }
                    if (radioButton4.Checked == true)
                    {
                        view.DiffuseSmallSphere();

                    }
                    if (radioButton5.Checked == true)
                    {
                        view.ReflectSmallSphere();

                    }
                    view.Setup();
                    view.Update();
                    glControl1.SwapBuffers();
                    GL.UseProgram(0);
                }
                else MessageBox.Show("Введите корректные данные", "Ошибка", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            catch
            {
                MessageBox.Show("Введите корректные данные", "Ошибка",
                MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void button4_Click(object sender, EventArgs e)
        {
            groupBox2.Visible = true;
        }

        private void checkBox3_CheckedChanged(object sender, EventArgs e)       //куб
        {
            if (checkBox3.Checked == false)
            {
                groupBox3.Visible = false;
                view.OffCub();
            }
            else
            {
                groupBox3.Visible = true;
                if (radioButton9.Checked == true) view.RefractCub();
                else if (radioButton7.Checked == true) view.DiffuseCub();
                else if (radioButton8.Checked == true) view.ReflectCub();
            }
            view.Setup();
            view.Update();
            glControl1.SwapBuffers();
            GL.UseProgram(0);
        }

        private void button5_Click(object sender, EventArgs e)
        {
            double x1 = 0, y1 = 0, z1 = 0, x2 = 0, y2 = 0, z2 = 0, x3 = 0, y3 = 0, z3 = 0;
            try
            {
                x1 = Convert.ToDouble(textBox7.Text);
                y1 = Convert.ToDouble(textBox8.Text);
                z1 = Convert.ToDouble(textBox9.Text);
                x2 = Convert.ToDouble(textBox10.Text);
                y2 = Convert.ToDouble(textBox11.Text);
                z2 = Convert.ToDouble(textBox12.Text);
                x3 = Convert.ToDouble(textBox13.Text);
                y3 = Convert.ToDouble(textBox14.Text);
                z3 = Convert.ToDouble(textBox15.Text);
                if ((x1 <= 1.0) && (y1 <= 1.0) && (z1 <= 1.0) && (x1 >= 0.0) && (y1 >= 0.0) && (z1 >= 0.0) &&
                    (x2 <= 1.0) && (y2 <= 1.0) && (z2 <= 1.0) && (x2 >= 0.0) && (y2 >= 0.0) && (z2 >= 0.0) &&
                    (x3 <= 1.0) && (y3 <= 1.0) && (z3 <= 1.0) && (x3 >= 0.0) && (y3 >= 0.0) && (z3 >= 0.0))
                {
                    view.ColorCub((float)x1, (float)y1, (float)z1, (float)x2,
                        (float)y2, (float)z2, (float)x3, (float)y3, (float)z3);                    
                    if (radioButton9.Checked == true)
                    {
                        view.RefractCub();

                    }
                    if (radioButton7.Checked == true)
                    {
                        view.DiffuseCub();

                    }
                    if (radioButton8.Checked == true)
                    {
                        view.ReflectCub();

                    }
                    view.Setup();
                    view.Update();
                    glControl1.SwapBuffers();
                    GL.UseProgram(0);                }
                else MessageBox.Show("Введите корректные данные", "Ошибка", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            catch
            {
                MessageBox.Show("Введите корректные данные", "Ошибка",
                MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void button6_Click(object sender, EventArgs e)
        {
            groupBox3.Visible = true;
        }

        private void checkBox4_CheckedChanged(object sender, EventArgs e)   //тетраэдр
        {
            if (checkBox4.Checked == false)
            {
                groupBox4.Visible = false;
                view.OffTet();
            }
            else
            {
                groupBox4.Visible = true;
                if (radioButton12.Checked == true) view.RefractTet();
                else if (radioButton10.Checked == true) view.DiffuseTet();
                else if (radioButton11.Checked == true) view.ReflectTet();
            }
            view.Setup();
            view.Update();
            glControl1.SwapBuffers();
            GL.UseProgram(0);
        }

        private void button7_Click(object sender, EventArgs e)
        {
            double x1 = 0, y1 = 0, z1 = 0, x2 = 0, y2 = 0, z2 = 0;
            try
            {
                x1 = Convert.ToDouble(textBox16.Text);
                y1 = Convert.ToDouble(textBox17.Text);
                z1 = Convert.ToDouble(textBox18.Text);
                x2 = Convert.ToDouble(textBox19.Text);
                y2 = Convert.ToDouble(textBox20.Text);
                z2 = Convert.ToDouble(textBox21.Text);               
                if ((x1 <= 1.0) && (y1 <= 1.0) && (z1 <= 1.0) && (x1 >= 0.0) && (y1 >= 0.0) && (z1 >= 0.0) &&
                    (x2 <= 1.0) && (y2 <= 1.0) && (z2 <= 1.0) && (x2 >= 0.0) && (y2 >= 0.0) && (z2 >= 0.0))
                {
                    view.ColorTet((float)x1, (float)y1, (float)z1, (float)x2, (float)y2, (float)z2);
                    if (radioButton12.Checked == true)
                    {
                        view.RefractTet();

                    }
                    if (radioButton10.Checked == true)
                    {
                        view.DiffuseTet();

                    }
                    if (radioButton11.Checked == true)
                    {
                        view.ReflectTet();

                    }
                    view.Setup();
                    view.Update();
                    glControl1.SwapBuffers();
                    GL.UseProgram(0);
                }
                else MessageBox.Show("Введите корректные данные", "Ошибка", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            catch
            {
                MessageBox.Show("Введите корректные данные", "Ошибка",
                MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void button8_Click(object sender, EventArgs e)
        {
            groupBox4.Visible = true;
        }

    }
}
