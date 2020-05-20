using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Drawing;
using System.IO;
using OpenTK;
using OpenTK.Graphics.OpenGL4;

namespace Lab3Boytsov
{
    
    class View
    {
        Vector3 Big_Sphere = new Vector3(0.0f, 0.0f, 1.0f);     //способ отрображения большой сферы
        Vector3 ColBigSphere = new Vector3(0.0f, 0.0f, 1.0f);   //цвет большой сферы
        Vector3 Small_Sphere = new Vector3(0.0f, 1.0f, 0.0f);   //способ отображения маленькой сферы
        Vector3 ColSmallSphere = new Vector3(1.0f, 1.0f, 1.0f); //цвет маленькой сферы
        Vector3 Cub = new Vector3(0.0f, 0.0f, 0.0f);            //способ отображения куба
        Vector3 ColCub1 = new Vector3(1.1f, 1.0f, 0.1f);        //цвет 1 грани куба
        Vector3 ColCub2 = new Vector3(1.0f, 0.5f, 1.0f);        //цвет 2 грани куба
        Vector3 ColCub3 = new Vector3(0.8f, 0.8f, 0.5f);        //цвет 3 грани куба
        Vector3 Tet = new Vector3(0.0f, 0.0f, 0.0f);            //способ отображения тетраэдра
        Vector3 ColTet1 = new Vector3(0.1f, 1.0f, 0.1f);        //цвет 1 грани тетраэдра
        Vector3 ColTet2 = new Vector3(1.0f, 0.5f, 1.0f);        //цвет 2 грани тетраэдра
        
        int BasicProgramID;
        int BasicVertexSheder;
        int BasicFragmentShader;
        int vbo_position;           
        int attribute_vpos;
        int uniform_pos;
        Vector3 campos;
        int uniform_aspect;
        double aspect;
        Vector3[] vertdata;

        public void Setup()       
        {           
            InitShaders();
            InitBuffer();
        }
        public void Update()
        {
            GL.Clear(ClearBufferMask.ColorBufferBit | ClearBufferMask.DepthBufferBit);
            GL.Enable(EnableCap.Texture2D);
            GL.EnableVertexAttribArray(attribute_vpos);     
            GL.DrawArrays(PrimitiveType.Quads, 0, 4);       
            GL.DisableVertexAttribArray(attribute_vpos);   

        }
        void loadShader(String filename, ShaderType type, int program, out int address)     
        {
            address = GL.CreateShader(type);           
            using (System.IO.StreamReader sr = new StreamReader(filename))
            {
                GL.ShaderSource(address, sr.ReadToEnd());   
            }
            GL.CompileShader(address);               
            GL.AttachShader(program, address);      
            Console.WriteLine(GL.GetShaderInfoLog(address));
        }
        private void InitShaders()      
        {
            BasicProgramID = GL.CreateProgram();  
            loadShader("../../raytracing.vert", ShaderType.VertexShader,
                BasicProgramID, out BasicVertexSheder);
            loadShader("../../raytracing1.frag", ShaderType.FragmentShader,
                BasicProgramID, out BasicFragmentShader);
            GL.LinkProgram(BasicProgramID);
            int status = 0;
            GL.GetProgram(BasicProgramID, GetProgramParameterName.LinkStatus, out status);
            Console.WriteLine(GL.GetProgramInfoLog(BasicProgramID));
        }
        private void InitBuffer()                        
        {
            vertdata = new Vector3[] 
            {
                new Vector3(-1f, -1f, 0f),
                new Vector3(1f, -1f, 0f),
                new Vector3(1f, 1f, 0f),
                new Vector3(-1f, 1f, 0f)
            };
            GL.GenBuffers(1, out vbo_position);
            GL.BindBuffer(BufferTarget.ArrayBuffer, vbo_position);
            GL.BufferData<Vector3>(BufferTarget.ArrayBuffer, (IntPtr)(vertdata.Length *    
                                    Vector3.SizeInBytes), vertdata, BufferUsageHint.StaticDraw);
            GL.VertexAttribPointer(attribute_vpos, 3, VertexAttribPointerType.Float, false, 0, 0);
            GL.Uniform3(uniform_pos, campos);
            GL.Uniform1(uniform_aspect, aspect);            
            GL.UseProgram(BasicProgramID);
            GL.Uniform3(GL.GetUniformLocation(BasicProgramID, "BigSphere"), ref Big_Sphere);
            GL.Uniform3(GL.GetUniformLocation(BasicProgramID, "ColBigSphere"), ref ColBigSphere);
            GL.Uniform3(GL.GetUniformLocation(BasicProgramID, "SmallSphere"), ref Small_Sphere);
            GL.Uniform3(GL.GetUniformLocation(BasicProgramID, "ColSmallSphere"), ref ColSmallSphere);
            GL.Uniform3(GL.GetUniformLocation(BasicProgramID, "Cub"), ref Cub);
            GL.Uniform3(GL.GetUniformLocation(BasicProgramID, "ColCub1"), ref ColCub1);
            GL.Uniform3(GL.GetUniformLocation(BasicProgramID, "ColCub2"), ref ColCub2);
            GL.Uniform3(GL.GetUniformLocation(BasicProgramID, "ColCub3"), ref ColCub3);
            GL.Uniform3(GL.GetUniformLocation(BasicProgramID, "Tet"), ref Tet);
            GL.Uniform3(GL.GetUniformLocation(BasicProgramID, "ColTet1"), ref ColTet1);
            GL.Uniform3(GL.GetUniformLocation(BasicProgramID, "ColTet2"), ref ColTet2);
            GL.BindBuffer(BufferTarget.ArrayBuffer, 0);
        }

        public void OffBigSphere()    
        {           
            Big_Sphere = new Vector3(0.0f, 0.0f, 0.0f);
        }
        public void ColorBigSphere(float x, float y, float z)
        {
            ColBigSphere = new Vector3(x, y, z);            
        }
        public void RefractBigSphere()                          
        {
            Big_Sphere = new Vector3(0.0f, 0.0f, 1.0f);
        }
        public void DiffuseBigSphere()                      
        {
            Big_Sphere = new Vector3(1.0f, 0.0f, 0.0f);
        }
        public void ReflectBigSphere()                       
        {
            Big_Sphere = new Vector3(0.0f, 1.0f, 0.0f);
        }


        public void OffSmallSphere()                                   
        {
            Small_Sphere = new Vector3(0.0f, 0.0f, 0.0f);
        }
        public void ColorSmallSphere(float x, float y, float z)        
        {
            ColSmallSphere = new Vector3(x, y, z);
        }
        public void RefractSmallSphere()                               
        {
            Small_Sphere = new Vector3(0.0f, 0.0f, 1.0f);
        }
        public void DiffuseSmallSphere()                        
        {
            Small_Sphere = new Vector3(1.0f, 0.0f, 0.0f);
        }
        public void ReflectSmallSphere()                         
        {
            Small_Sphere = new Vector3(0.0f, 1.0f, 0.0f);
        }


        public void OffCub()
        {
            Cub = new Vector3(0.0f, 0.0f, 0.0f);
        }
        public void ColorCub(float x1, float y1, float z1, float x2, float y2, float z2, float x3, float y3, float z3)
        {
            ColCub1 = new Vector3(x1, y1, z1);
            ColCub2 = new Vector3(x2, y2, z2);
            ColCub3 = new Vector3(x3, y3, z3);
        }
        public void RefractCub()
        {
            Cub = new Vector3(0.0f, 0.0f, 1.0f);
        }
        public void DiffuseCub()
        {
            Cub = new Vector3(1.0f, 0.0f, 0.0f);
        }
        public void ReflectCub()
        {
            Cub = new Vector3(0.0f, 1.0f, 0.0f);
        }


        public void OffTet()
        {
            Tet = new Vector3(0.0f, 0.0f, 0.0f);
        }
        public void ColorTet(float x1, float y1, float z1, float x2, float y2, float z2)
        {
            ColTet1 = new Vector3(x1, y1, z1);
            ColTet2 = new Vector3(x2, y2, z2);           
        }
        public void RefractTet()
        {
            Tet = new Vector3(0.0f, 0.0f, 1.0f);
        }
        public void DiffuseTet()
        {
            Tet = new Vector3(1.0f, 0.0f, 0.0f);
        }
        public void ReflectTet()
        {
            Tet = new Vector3(0.0f, 1.0f, 0.0f);
        }
    }
}
